# pharmacy/views.py
from rest_framework import viewsets, status
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum
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
    permission_classes = [IsAuthenticated, CannotDeletePharmacy]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Pharmacy.objects.all()
        return Pharmacy.objects.filter(pharmacist=user)

    def perform_create(self, serializer):
        serializer.save(pharmacist=self.request.user)


class PharmacyMedicineViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [IsAuthenticated, CanManageInventory]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return PharmacyMedicine.objects.select_related('pharmacy', 'medicine')
        return PharmacyMedicine.objects.filter(pharmacy=user.pharmacy)

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
                pm, _ = PharmacyMedicine.objects.get_or_create(
                    pharmacy=request.user.pharmacy,
                    medicine_id=med_id,
                    defaults={'quantity': 0}
                )
                pm.add_stock(qty, request.user, reason)
                added.append(med_id)
            else:
                errors.append({"errors": serializer.errors, "entry": entry})

        return Response({'added': added, 'errors': errors}, status=207 if errors else 200)


class ManagerViewSet(viewsets.ModelViewSet):
    serializer_class = ManagerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPharmacistOwner]
    lookup_field = 'id'

    def get_queryset(self):
        # Pharmacists can only see permissions for their own pharmacy
        return Manager.objects.filter(
            pharmacy=self.request.user.pharmacist.pharmacy
        )

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
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        total = Sale.objects.filter(pharmacy=request.user.pharmacy, created_at__date=day).aggregate(total=Sum('total_amount'))['total'] or 0
        stats.append({"date": day.strftime("%Y-%m-%d"), "total": total})
    return Response(stats)
