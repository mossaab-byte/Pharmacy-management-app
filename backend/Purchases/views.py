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
        # Filter suppliers by the current user's pharmacy
        user = self.request.user
        if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            queryset = Supplier.objects.filter(pharmacy=user.owned_pharmacy)
        elif hasattr(user, 'pharmacy') and user.pharmacy:
            queryset = Supplier.objects.filter(pharmacy=user.pharmacy)
        else:
            queryset = Supplier.objects.none()
            
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
        user = request.user
        # Check if user owns a pharmacy
        if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            transactions = SupplierTransaction.objects.filter(
                supplier_id=pk,
                pharmacy=user.owned_pharmacy
            ).order_by('-date')
        else:
            transactions = SupplierTransaction.objects.none()
        serializer = SupplierTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def purchases(self, request, pk=None):
        user = request.user
        if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            purchases = Purchase.objects.filter(
                supplier_id=pk,
                pharmacy=user.owned_pharmacy
            )
        else:
            purchases = Purchase.objects.none()
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        user = request.user
        if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            medicine_ids = PurchaseItem.objects.filter(
                purchase__supplier_id=pk,
                purchase__pharmacy=user.owned_pharmacy
            ).values_list('medicine_id', flat=True).distinct()
        else:
            medicine_ids = []
        from Medicine.models import Medicine
        medicines = Medicine.objects.filter(id__in=medicine_ids)
        data = [{'id': m.id, 'name': m.name} for m in medicines]
        return Response(data)



    @action(detail=True, methods=['post'])
    def payments(self, request, pk=None):
        """Record a payment from supplier"""
        supplier = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        reference = request.data.get('reference', f'Payment-{amount}')
        notes = request.data.get('notes', '')

        if amount <= 0:
            return Response({'detail': 'Invalid amount. Must be greater than 0.'}, status=400)
        
        if amount > supplier.current_balance:
            return Response({'detail': f'Payment amount ({amount}) exceeds current balance ({supplier.current_balance})'}, status=400)

        transaction = SupplierTransaction.objects.create(
            supplier=supplier,
            pharmacy=request.user.pharmacy,
            type='payment',
            amount=amount,
            reference=reference,
            notes=notes,
            created_by=request.user,
        )
        supplier.update_balance()
        
        return Response({
            'detail': f'Payment of {amount} recorded successfully',
            'new_balance': float(supplier.current_balance),
            'transaction_id': str(transaction.id)
        })
    
    @action(detail=True, methods=['post'])
    def reduce_credit(self, request, pk=None):
        """Reduce supplier credit by a specific amount (partial payment)"""
        supplier = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        reference = request.data.get('reference', f'Credit reduction - {amount}')

        if amount <= 0:
            return Response({'detail': 'Invalid amount. Must be greater than 0.'}, status=400)
        
        if amount > supplier.current_balance:
            return Response({'detail': f'Amount ({amount}) exceeds current balance ({supplier.current_balance})'}, status=400)

        transaction = SupplierTransaction.objects.create(
            supplier=supplier,
            pharmacy=request.user.pharmacy,
            type='payment',
            amount=amount,
            reference=reference,
            created_by=request.user,
        )
        supplier.update_balance()
        
        return Response({
            'detail': f'Credit reduced by {amount}',
            'new_balance': float(supplier.current_balance),
            'transaction_id': str(transaction.id)
        })

    def perform_create(self, serializer):
        # Set pharmacy automatically based on the current user
        user = self.request.user
        print(f"🔍 SUPPLIER CREATE - User: {user.username}")
        print(f"🔍 SUPPLIER CREATE - Has owned_pharmacy: {hasattr(user, 'owned_pharmacy')}")
        print(f"🔍 SUPPLIER CREATE - owned_pharmacy: {getattr(user, 'owned_pharmacy', None)}")
        
        pharmacy = None
        if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
            pharmacy = user.owned_pharmacy
            print(f"🔍 SUPPLIER CREATE - Using owned_pharmacy: {pharmacy}")
        elif hasattr(user, 'pharmacy') and user.pharmacy:
            pharmacy = user.pharmacy
            print(f"🔍 SUPPLIER CREATE - Using pharmacy: {pharmacy}")
        
        if pharmacy:
            serializer.save(pharmacy=pharmacy)
            print(f"✅ SUPPLIER CREATE - Saved with pharmacy: {pharmacy}")
        else:
            print("❌ SUPPLIER CREATE - No pharmacy found!")
            from rest_framework.exceptions import ValidationError
            raise ValidationError("No pharmacy found for user. Please contact administrator.")
    
    @action(detail=True, methods=['post'])
    def reset_credit(self, request, pk=None):
        """Reset supplier credit to zero (full payment)"""
        supplier = self.get_object()
        reference = request.data.get('reference', 'Credit reset to zero')
        
        if supplier.current_balance <= 0:
            return Response({'detail': 'No outstanding balance to reset.'}, status=400)

        old_balance = supplier.current_balance
        
        # Create a payment transaction for the full amount to clear the balance
        transaction = SupplierTransaction.objects.create(
            supplier=supplier,
            pharmacy=request.user.pharmacy,
            type='payment',
            amount=old_balance,  # Payment for the full amount
            reference=reference,
            created_by=request.user,
        )
        supplier.update_balance()
        
        return Response({
            'detail': f'Credit reset from {old_balance} to 0',
            'old_balance': float(old_balance),
            'new_balance': float(supplier.current_balance),
            'transaction_id': str(transaction.id)
        })
   
    
class PurchaseViewSet(viewsets.ModelViewSet):

    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated, CanModifyPurchases, CanDeletePurchases]

    def get_queryset(self):
        user = self.request.user
        queryset = Purchase.objects.select_related('supplier', 'pharmacy', 'received_by').prefetch_related('items__medicine')
        # Restrict by pharmacy if needed
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
                queryset = queryset.filter(pharmacy=user.owned_pharmacy)
        elif hasattr(user, 'owned_pharmacy'):
            queryset = queryset.filter(pharmacy=user.owned_pharmacy)

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
        # Set pharmacy automatically based on the current user
        print(f"🔍 perform_create called for user: {self.request.user}")
        print(f"🔍 User has pharmacy attr: {hasattr(self.request.user, 'pharmacy')}")
        print(f"🔍 User.pharmacy: {getattr(self.request.user, 'pharmacy', None)}")
        print(f"🔍 User has owned_pharmacy attr: {hasattr(self.request.user, 'owned_pharmacy')}")
        print(f"🔍 User.owned_pharmacy: {getattr(self.request.user, 'owned_pharmacy', None)}")
        
        pharmacy = None
        if hasattr(self.request.user, 'pharmacy') and self.request.user.pharmacy:
            pharmacy = self.request.user.pharmacy
            print(f"🔍 Using user.pharmacy: {pharmacy}")
        elif hasattr(self.request.user, 'owned_pharmacy') and self.request.user.owned_pharmacy:
            pharmacy = self.request.user.owned_pharmacy
            print(f"🔍 Using user.owned_pharmacy: {pharmacy}")
        else:
            # Check if user is a manager with pharmacy access
            print(f"🔍 Checking Manager table...")
            from Pharmacy.models import Manager
            manager_permission = Manager.objects.filter(user=self.request.user).first()
            print(f"🔍 Manager found: {manager_permission}")
            if manager_permission:
                pharmacy = manager_permission.pharmacy
                print(f"🔍 Using manager.pharmacy: {pharmacy}")
        
        print(f"🔍 Final pharmacy: {pharmacy}")
        if not pharmacy:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("No pharmacy found for user. Please contact administrator.")
        
        serializer.save(received_by=self.request.user, pharmacy=pharmacy)

    def perform_update(self, serializer):
        print(f"🔍 perform_update called for purchase: {serializer.instance.id}")
        print(f"🔍 User: {self.request.user}")
        print(f"🔍 Old total: {serializer.instance.total_amount}")
        print(f"🔍 Old supplier: {serializer.instance.supplier.name}")
        
        # Save the updated purchase (the serializer's update method handles the complex logic)
        serializer.save()
        
        print(f"🔍 Purchase update completed: {serializer.instance.id}")
        print(f"🔍 New total: {serializer.instance.total_amount}")
        print(f"🔍 New supplier: {serializer.instance.supplier.name}")

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


@api_view(['POST'])
@permission_classes([CanManageSupplier])
def reduce_supplier_credit(request, supplier_id):
    """Reduce supplier credit by a specific amount (partial payment)"""
    supplier = get_object_or_404(Supplier, id=supplier_id)
    amount = Decimal(request.data.get('amount', 0))
    reference = request.data.get('reference', f'Credit reduction - {amount}')

    if amount <= 0:
        return Response({'detail': 'Invalid amount. Must be greater than 0.'}, status=400)
    
    if amount > supplier.current_balance:
        return Response({'detail': f'Amount ({amount}) exceeds current balance ({supplier.current_balance})'}, status=400)

    transaction = SupplierTransaction.objects.create(
        supplier=supplier,
        pharmacy=request.user.pharmacy,
        type='payment',
        amount=amount,
        reference=reference,
        created_by=request.user,
    )
    supplier.update_balance()
    
    return Response({
        'detail': f'Credit reduced by {amount}',
        'new_balance': float(supplier.current_balance),
        'transaction_id': str(transaction.id)
    })


@api_view(['POST'])
@permission_classes([CanManageSupplier])
def reset_supplier_credit(request, supplier_id):
    """Reset supplier credit to zero (full payment)"""
    supplier = get_object_or_404(Supplier, id=supplier_id)
    reference = request.data.get('reference', 'Credit reset to zero')
    
    if supplier.current_balance <= 0:
        return Response({'detail': 'No outstanding balance to reset.'}, status=400)

    old_balance = supplier.current_balance
    
    # Create a payment transaction for the full amount to clear the balance
    transaction = SupplierTransaction.objects.create(
        supplier=supplier,
        pharmacy=request.user.pharmacy,
        type='payment',
        amount=old_balance,  # Payment for the full amount
        reference=reference,
        created_by=request.user,
    )
    supplier.update_balance()
    
    return Response({
        'detail': f'Credit reset from {old_balance} to 0',
        'old_balance': float(old_balance),
        'new_balance': float(supplier.current_balance),
        'transaction_id': str(transaction.id)
    })