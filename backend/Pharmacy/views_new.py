# pharmacy/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from datetime import timedelta, date

from .models import Pharmacy, PharmacyMedicine, Manager
from .serializers import PharmacySerializer, PharmacyMedicineSerializer, ManagerSerializer, StockAdjustmentSerializer, BulkPharmacyMedicineSerializer
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
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser:
            # Superuser can see all pharmacy medicines
            return PharmacyMedicine.objects.select_related('pharmacy', 'medicine').all()
        elif user.is_pharmacist:
            # Pharmacist can see medicines from their pharmacy
            if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
                return PharmacyMedicine.objects.filter(pharmacy=user.owned_pharmacy).select_related('pharmacy', 'medicine')
            elif user.pharmacy:
                return PharmacyMedicine.objects.filter(pharmacy=user.pharmacy).select_related('pharmacy', 'medicine')
        elif user.is_manager and user.pharmacy:
            # Manager can see medicines from their pharmacy
            return PharmacyMedicine.objects.filter(pharmacy=user.pharmacy).select_related('pharmacy', 'medicine')
        
        # Default: no access
        return PharmacyMedicine.objects.none()

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
            'performed_by': log.performed_by.get_full_name() if log.performed_by else 'System',
            'transaction_type': log.transaction_type
        } for log in logs])


class ManagerViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerSerializer
    permission_classes = [IsAuthenticated]
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
