from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import *
from .serializers import *
from .permissions import *
from decimal import Decimal
from django.shortcuts import get_object_or_404
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageSupplier]

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        transactions = SupplierTransaction.objects.filter(supplier_id=pk)
        serializer = SupplierTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def purchases(self, request, pk=None):
        purchases = Purchase.objects.filter(supplier_id=pk)
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        medicine_ids = PurchaseItem.objects.filter(
            purchase__supplier_id=pk
        ).values_list('medicine_id', flat=True).distinct()
        from Medicine.models import Medicine
        medicines = Medicine.objects.filter(id__in=medicine_ids)
        data = [{'id': m.id, 'name': m.name} for m in medicines]
        return Response(data)



    @action(detail=True, methods=['post'])
    def payments(self, request, pk=None):
        return record_supplier_payment(request, supplier_id=pk)
   
    
class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated, CanModifyPurchases, CanDeletePurchases]

    def get_queryset(self):
        user = self.request.user
        
        # For basic pharmacists, allow access to all purchases
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            if hasattr(user, 'pharmacy') and user.pharmacy:
                return Purchase.objects.filter(pharmacy=user.pharmacy)
            else:
                # Basic pharmacist - return all purchases for now
                return Purchase.objects.all()
        
        if hasattr(user, 'pharmacy'):
            return Purchase.objects.filter(pharmacy=user.pharmacy)
        return Purchase.objects.none()

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)

@api_view(['POST'])
@permission_classes([CanManageSupplier])
def record_supplier_payment(request, supplier_id):
    supplier = get_object_or_404(Supplier, id=supplier_id)
    amount = Decimal(request.data.get('amount', 0))
    reference = request.data.get('reference', '')

    if amount <= 0:
        return Response({'detail': 'Invalid amount'}, status=400)

    SupplierTransaction.objects.create(
        supplier=supplier,
        pharmacy=request.user.pharmacy,
        type='payment',
        amount=amount,
        reference=reference,
        created_by=request.user,
    )
    supplier.update_balance()
    return Response({'detail': 'Payment recorded'})