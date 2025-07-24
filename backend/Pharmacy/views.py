# pharmacy/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework.exceptions import ValidationError
from .models import Manager
from .serializers import ManagerSerializer
from datetime import timedelta, date
from rest_framework.permissions import *

from .models import *
from .serializers import *
from .permissions import *
from Inventory.models import InventoryLog
from Sales.models import Sale
from django.contrib.auth import get_user_model

User = get_user_model()

class PharmacyViewSet(viewsets.ModelViewSet):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            # Superuser can see all pharmacies
            return Pharmacy.objects.all()
        elif user.is_pharmacist and hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            # Pharmacist can only see their own pharmacy
            return Pharmacy.objects.filter(id=user.owned_pharmacy.id)
        elif user.pharmacy:
            # User belongs to a pharmacy
            return Pharmacy.objects.filter(id=user.pharmacy.id)
        else:
            # No pharmacy access
            return Pharmacy.objects.none()

    def perform_create(self, serializer):
        # Only allow one pharmacy per pharmacist (unless superuser)
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'owned_pharmacy') and self.request.user.owned_pharmacy:
                raise ValidationError("You already own a pharmacy")
        serializer.save(pharmacist=self.request.user)


class PharmacyMedicineViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'], url_path='full-inventory')
    def full_inventory(self, request):
        """
        Returns all medicines, with inventory info if present for the user's pharmacy, or a flag if not.
        """
        from Medicine.models import Medicine
        from .models import PharmacyMedicine
        from .serializers import PharmacyMedicineSerializer
        user = request.user
        # Determine pharmacy
        pharmacy = None
        if user.is_superuser and 'pharmacy_id' in request.query_params:
            from Pharmacy.models import Pharmacy
            try:
                pharmacy = Pharmacy.objects.get(id=request.query_params['pharmacy_id'])
            except Exception:
                pharmacy = None
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            pharmacy = user.owned_pharmacy
        elif hasattr(user, 'pharmacy') and user.pharmacy:
            pharmacy = user.pharmacy
        if not pharmacy:
            return Response({'error': 'No pharmacy found for user.'}, status=400)

        medicines = Medicine.objects.all().order_by('nom')
        inventory_map = {pm.medicine_id: pm for pm in PharmacyMedicine.objects.filter(pharmacy=pharmacy)}
        result = []
        for med in medicines:
            pm = inventory_map.get(med.id)
            if pm:
                data = PharmacyMedicineSerializer(pm).data
                data['in_inventory'] = True
            else:
                data = {
                    'id': None,
                    'medicine': med.id,
                    'medicine_name': med.nom,
                    'medicine_code': med.code,
                    'quantity': 0,
                    'in_inventory': False,
                    'pharmacy': pharmacy.id,
                }
            result.append(data)
        return Response(result)
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = PharmacyMedicine.objects.select_related('pharmacy', 'medicine')
        if user.is_superuser:
            pass  # all pharmacies
        elif user.is_pharmacist:
            if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
                qs = qs.filter(pharmacy=user.owned_pharmacy)
            elif user.pharmacy:
                qs = qs.filter(pharmacy=user.pharmacy)
            else:
                return PharmacyMedicine.objects.none()
        elif user.is_manager and user.pharmacy:
            qs = qs.filter(pharmacy=user.pharmacy)
        else:
            return PharmacyMedicine.objects.none()

        # Annotate for sorting: quantity>0 first, then by name
        from django.db.models import Case, When, Value, IntegerField
        qs = qs.annotate(
            has_stock=Case(
                When(quantity__gt=0, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).order_by('-has_stock', '-quantity', 'medicine__nom')
        return qs

    def perform_create(self, serializer):
        # Assign to user's pharmacy
        user = self.request.user
        pharmacy = None
        
        if user.is_superuser:
            # Superuser can specify pharmacy or use default
            pharmacy = serializer.validated_data.get('pharmacy')
            if not pharmacy:
                pharmacy = user.pharmacy or Pharmacy.objects.first()
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            pharmacy = user.owned_pharmacy
        elif user.pharmacy:
            pharmacy = user.pharmacy
        
        if not pharmacy:
            raise ValidationError("No pharmacy assigned to user")
            
        serializer.save(pharmacy=pharmacy)
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [IsAuthenticated, CanManageInventory]

    def get_queryset(self):
        user = self.request.user
        if user.is_pharmacist or user.is_superuser:
            return PharmacyMedicine.objects.select_related('pharmacy', 'medicine')
        # If user has a pharmacy, filter by that pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy:
            return PharmacyMedicine.objects.filter(pharmacy=user.pharmacy)
        # Otherwise return empty queryset
        return PharmacyMedicine.objects.none()

    @action(detail=True, methods=['post'], serializer_class=StockAdjustmentSerializer)
    def add_stock(self, request, pk=None):
        pm = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pm.add_stock(serializer.validated_data['amount'], request.user, serializer.validated_data['reason'])
        return Response({'status': 'stock added'})

    @action(detail=True, methods=['post'], serializer_class=StockAdjustmentSerializer)
    def reduce_stock(self, request, pk=None):
        pm = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        success = pm.reduce_stock(serializer.validated_data['amount'], request.user, serializer.validated_data['reason'])
        if not success:
            return Response({'error': 'Insufficient stock'}, status=400)
        return Response({'status': 'stock reduced'})

    @action(detail=True, methods=['get'])
    def stock_history(self, request, pk=None):
        logs = InventoryLog.objects.filter(pharmacy_medicine_id=pk).order_by('-timestamp')
        return Response([{
            'timestamp': log.timestamp,
            'quantity_changed': log.quantity_changed,
            'reason': log.reason,
            'performed_by': log.performed_by.get_full_name(),
            'transaction_type': log.transaction_type
        } for log in logs])

    @action(detail=False, methods=['post'], url_path='bulk-add', serializer_class=BulkPharmacyMedicineSerializer)
    def bulk_add(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({'error': 'Expected a list of items.'}, status=400)

        errors, added = [], []
        for entry in data:
            serializer = BulkPharmacyMedicineSerializer(data=entry)
            if serializer.is_valid():
                med_id = serializer.validated_data['medicine_id']
                qty = serializer.validated_data['quantity']
                reason = serializer.validated_data['reason']
                # Get or create PharmacyMedicine for the user's pharmacy or first available pharmacy
                user_pharmacy = None
                if hasattr(request.user, 'pharmacy') and request.user.pharmacy:
                    user_pharmacy = request.user.pharmacy
                else:
                    # Get first available pharmacy as fallback
                    user_pharmacy = Pharmacy.objects.first()
                
                if user_pharmacy:
                    pm, _ = PharmacyMedicine.objects.get_or_create(
                        pharmacy=user_pharmacy,
                        medicine_id=med_id,
                        defaults={'quantity': 0}
                    )
                    pm.add_stock(qty, request.user, reason)
                    added.append(med_id)
                else:
                    errors.append({"errors": {"pharmacy": "No pharmacy available"}, "entry": entry})
            else:
                errors.append({"errors": serializer.errors, "entry": entry})

        return Response({'added': added, 'errors': errors}, status=207 if errors else 200)


class ManagerViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPharmacistOwner]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        # For superusers and pharmacists, show all managers
        if user.is_superuser or user.is_pharmacist:
            return Manager.objects.all()
        # For regular users, check if they have a pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy:
            return Manager.objects.filter(pharmacy=user.pharmacy)
        # Otherwise return empty queryset
        return Manager.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated, CanViewReports])
def sales_stats(request):
    today = date.today()
    stats = []
    user = request.user
    
    # Get the pharmacy to filter by
    pharmacy = None
    if hasattr(user, 'pharmacy') and user.pharmacy:
        pharmacy = user.pharmacy
    else:
        # If no pharmacy, get first available pharmacy or return empty stats
        pharmacy = Pharmacy.objects.first()
    
    if not pharmacy:
        return Response([])
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        total = Sale.objects.filter(pharmacy=pharmacy, created_at__date=day).aggregate(total=Sum('total_amount'))['total'] or 0
        stats.append({"date": day.strftime("%Y-%m-%d"), "total": total})
    return Response(stats)

    @action(detail=True, methods=['post'], url_path='manual-stock-add')
    def manual_stock_add(self, request, pk=None):
        """Add stock manually with permission check"""
        user = request.user
        
        # Check permissions
        if not (user.is_pharmacist or user.can_manage_inventory):
            return Response(
                {'error': 'Permission denied. You cannot manage inventory.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        pm = self.get_object()
        
        try:
            amount = int(request.data.get('quantity', 0))
            reason = request.data.get('reason', 'MANUAL_ADD')
            notes = request.data.get('notes', '')
            
            if amount <= 0:
                return Response(
                    {'error': 'Quantity must be positive'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add stock using the model method
            pm.add_stock(amount, user, f"{reason}: {notes}" if notes else reason)
            
            return Response({
                'message': f'Successfully added {amount} units to {pm.medicine.nom}',
                'new_quantity': pm.quantity,
                'added_by': user.username,
                'timestamp': pm.last_updated
            })
            
        except ValueError:
            return Response(
                {'error': 'Invalid quantity format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error adding stock: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        """Get medicines with low stock"""
        user = request.user
        threshold = int(request.query_params.get('threshold', 10))
        
        queryset = self.get_queryset().filter(quantity__lte=threshold)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'threshold': threshold,
            'medicines': serializer.data
        })
