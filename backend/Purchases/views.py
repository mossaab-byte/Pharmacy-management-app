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

    def get_queryset(self):
        queryset = Supplier.objects.all()
        search = self.request.query_params.get('search')
        sort_by = self.request.query_params.get('sort_by', 'name')
        sort_dir = self.request.query_params.get('sort_dir', 'asc')
        if search:
            queryset = queryset.filter(name__icontains=search)
        if sort_by:
            if sort_dir == 'desc':
                sort_by = f'-{sort_by}'
            queryset = queryset.order_by(sort_by)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        serializer = self.get_serializer(queryset[start:end], many=True)
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size
        })

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
        queryset = Purchase.objects.all()
        # Restrict by pharmacy if needed
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            if hasattr(user, 'pharmacy') and user.pharmacy:
                queryset = queryset.filter(pharmacy=user.pharmacy)
        elif hasattr(user, 'pharmacy'):
            queryset = queryset.filter(pharmacy=user.pharmacy)

        # Filtering
        search = self.request.query_params.get('search')
        supplier = self.request.query_params.get('supplier')
        status = self.request.query_params.get('status')
        if search:
            queryset = queryset.filter(supplier__name__icontains=search)
        if supplier:
            queryset = queryset.filter(supplier_id=supplier)
        if status:
            queryset = queryset.filter(status=status)

        # Sorting
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_dir = self.request.query_params.get('sort_dir', 'desc')
        if sort_by:
            if sort_dir == 'desc':
                sort_by = f'-{sort_by}'
            queryset = queryset.order_by(sort_by)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        serializer = self.get_serializer(queryset[start:end], many=True)
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size
        })

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