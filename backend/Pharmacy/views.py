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
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            # User owns a pharmacy
            return Pharmacy.objects.filter(id=user.owned_pharmacy.id)
        else:
            # Check if user is a manager with pharmacy access
            from .models import Manager
            manager_permission = Manager.objects.filter(user=user).first()
            if manager_permission:
                return Pharmacy.objects.filter(id=manager_permission.pharmacy.id)
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
        Returns paginated medicines, with inventory info if present for the user's pharmacy, or a flag if not.
        Supports ?search=...&page=...&page_size=...
        """
        from Medicine.models import Medicine
        from .models import PharmacyMedicine
        from .serializers import PharmacyMedicineSerializer
        from rest_framework.pagination import PageNumberPagination
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
        else:
            # Check if user is a manager with pharmacy access
            from .models import Manager
            manager_permission = Manager.objects.filter(user=user).first()
            if manager_permission:
                pharmacy = manager_permission.pharmacy
        
        if not pharmacy:
            return Response({'error': 'No pharmacy found for user.'}, status=400)

        # Search support
        search = request.query_params.get('search', '').strip().lower()
        medicines_qs = Medicine.objects.all()
        if search:
            medicines_qs = medicines_qs.filter(
                models.Q(nom__icontains=search) | models.Q(code__icontains=search)
            )

        # Sorting support
        sort_by = request.query_params.get('sort_by', 'nom')
        sort_dir = request.query_params.get('sort_dir', 'asc')
        if sort_by == 'quantity' or sort_by == 'status':
            # We'll sort after joining with inventory below
            pass
        else:
            if sort_dir == 'desc':
                sort_by = f'-{sort_by}'
            medicines_qs = medicines_qs.order_by(sort_by)

        # Inventory map for all medicines in this pharmacy
        inventory_map = {pm.medicine_id: pm for pm in PharmacyMedicine.objects.filter(pharmacy=pharmacy)}
        result = []
        for med in medicines_qs:
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

        # Status filtering
        status_filter = request.query_params.get('status')
        if status_filter == 'in_stock':
            result = [r for r in result if r['in_inventory'] and r['quantity'] > (r.get('minimum_stock_level') or 10)]
        elif status_filter == 'low_stock':
            result = [r for r in result if r['in_inventory'] and r['quantity'] <= (r.get('minimum_stock_level') or 10) and r['quantity'] > 0]
        elif status_filter == 'not_in_inventory':
            result = [r for r in result if not r['in_inventory']]

        # Sorting by quantity or status
        if sort_by == 'quantity':
            result = sorted(result, key=lambda r: r['quantity'], reverse=(sort_dir == 'desc'))
        elif sort_by == 'status':
            def status_rank(r):
                if not r['in_inventory']:
                    return 0
                elif r['quantity'] <= (r.get('minimum_stock_level') or 10):
                    return 1
                else:
                    return 2
            result = sorted(result, key=status_rank, reverse=(sort_dir == 'desc'))

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginator.page_size = int(request.query_params.get('page_size', 20))
        page = paginator.paginate_queryset(result, request)
        return paginator.get_paginated_response(page)
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = PharmacyMedicine.objects.select_related('pharmacy', 'medicine')
        
        if user.is_superuser:
            pass  # all pharmacies
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            # User owns a pharmacy
            qs = qs.filter(pharmacy=user.owned_pharmacy)
        else:
            # Check if user is a manager with pharmacy access
            from .models import Manager
            manager_permission = Manager.objects.filter(user=user).first()
            if manager_permission:
                qs = qs.filter(pharmacy=manager_permission.pharmacy)
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
                pharmacy = Pharmacy.objects.first()
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            pharmacy = user.owned_pharmacy
        else:
            # Check if user is a manager with pharmacy access
            from .models import Manager
            manager_permission = Manager.objects.filter(user=user).first()
            if manager_permission:
                pharmacy = manager_permission.pharmacy
        
        if not pharmacy:
            raise ValidationError("No pharmacy assigned to user")
            
        serializer.save(pharmacy=pharmacy)

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
                
                # Get user's pharmacy using consistent logic
                user_pharmacy = None
                if hasattr(request.user, 'owned_pharmacy') and request.user.owned_pharmacy:
                    user_pharmacy = request.user.owned_pharmacy
                else:
                    # Check if user is a manager with pharmacy access
                    from .models import Manager
                    manager_permission = Manager.objects.filter(user=request.user).first()
                    if manager_permission:
                        user_pharmacy = manager_permission.pharmacy
                
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
        if user.is_superuser:
            return Manager.objects.all()
        elif hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            # Pharmacy owner can see managers for their pharmacy
            return Manager.objects.filter(pharmacy=user.owned_pharmacy)
        else:
            # Check if user is a manager with pharmacy access
            manager_permission = Manager.objects.filter(user=user).first()
            if manager_permission:
                return Manager.objects.filter(pharmacy=manager_permission.pharmacy)
            else:
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
    
    # Get the pharmacy to filter by using consistent logic
    pharmacy = None
    if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
        pharmacy = user.owned_pharmacy
    else:
        # Check if user is a manager with pharmacy access
        from .models import Manager
        manager_permission = Manager.objects.filter(user=user).first()
        if manager_permission:
            pharmacy = manager_permission.pharmacy
    
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
