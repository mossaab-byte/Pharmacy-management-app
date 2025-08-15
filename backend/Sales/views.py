from rest_framework import viewsets, permissions
from .models import Customer, Sale, Payment
from .serializers import CustomerSerializer, SaleSerializer, SaleCreateSerializer
from .permissions import *
from rest_framework import generics
from django.shortcuts import get_object_or_404
from .serializers import CustomerSerializer, SaleSerializer, PaymentSerializer
from rest_framework import filters
# You can customize these permission classes as needed


class SalesViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Filter sales by user's pharmacy for proper data isolation
        if hasattr(user, 'pharmacy') and user.pharmacy:
            return Sale.objects.filter(pharmacy=user.pharmacy).order_by('-created_at')
        
        # If user has no pharmacy, return empty queryset
        return Sale.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer

    def create(self, request, *args, **kwargs):
        print("🚀 DEBUG: Create method called")
        print(f"🔍 DEBUG: Request data: {request.data}")
        print(f"🔍 DEBUG: Request method: {request.method}")
        print(f"🔍 DEBUG: Content type: {request.content_type}")
        
        try:
            response = super().create(request, *args, **kwargs)
            print(f"✅ DEBUG: Create successful, status: {response.status_code}")
            return response
        except Exception as e:
            print(f"❌ DEBUG: Create failed with error: {str(e)}")
            print(f"❌ DEBUG: Error type: {type(e)}")
            raise

    def perform_create(self, serializer):
        # Ensure sale is created for the user's pharmacy
        user = self.request.user
        
        if hasattr(user, 'pharmacy') and user.pharmacy:
            sale = serializer.save(
                served_by=user,
                pharmacy=user.pharmacy
            )
            print("✅ Sale created successfully with proper pharmacy isolation:", sale.id)
        else:
            print("❌ User has no pharmacy - cannot create sale")
            raise ValueError("User must be associated with a pharmacy to create sales")

class PharmacySalesListAPIView(generics.ListAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        pharmacy = getattr(user, 'pharmacy', None)

        if not pharmacy:
            return Sale.objects.none()

        queryset = Sale.objects.filter(pharmacy=pharmacy)

        # Optional filters
        start_date = self.request.query_params.get('start')
        end_date = self.request.query_params.get('end')

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset.order_by('-created_at')
class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'phone']    
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter customers based on sales from this pharmacy only
        if hasattr(user, 'pharmacy') and user.pharmacy:
            # Get customers who have made purchases at this pharmacy
            customer_ids = Sale.objects.filter(
                pharmacy=user.pharmacy
            ).values_list('customer_id', flat=True).distinct()
            
            return Customer.objects.filter(
                id__in=customer_ids
            ).select_related('user')
        
        return Customer.objects.none()

    def perform_create(self, serializer):
        serializer.save()
class CustomerDetailView(generics.RetrieveAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        
        # Only allow access to customers who have made purchases at this pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy:
            customer_ids = Sale.objects.filter(
                pharmacy=user.pharmacy
            ).values_list('customer_id', flat=True).distinct()
            
            return Customer.objects.filter(
                id__in=customer_ids
            ).select_related('user')
        
        return Customer.objects.none()

class CustomerSalesListView(generics.ListAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    
    def get_queryset(self):
        customer_id = self.kwargs['customer_id']
        user = self.request.user
        
        # Only return sales for this customer that belong to the current user's pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy:
            return Sale.objects.filter(
                customer_id=customer_id,
                pharmacy=user.pharmacy
            ).select_related('served_by', 'pharmacy').prefetch_related('items')
        
        return Sale.objects.none()

class CustomerPaymentsListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    
    def get_queryset(self):
        customer_id = self.kwargs['customer_id']
        user = self.request.user
        
        # Only return payments for sales that belong to the current user's pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy:
            return Payment.objects.filter(
                sale__customer_id=customer_id,
                sale__pharmacy=user.pharmacy
            ).select_related('sale', 'sale__served_by')
        
        return Payment.objects.none()
class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager, CanModifySales]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return Payment.objects.filter(sale__pharmacy=user.pharmacy)
        return Payment.objects.none()
    
    def perform_create(self, serializer):
        # Add validation if needed
        serializer.save()