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
    permission_classes = [permissions.AllowAny]  # Temporarily allow any access for testing

    def get_queryset(self):
        user = self.request.user
        
        # Return all sales for now during testing
        return Sale.objects.all().order_by('-created_at')

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
        # Debug: Print the request data
        print("🔍 DEBUG: Request data received:", self.request.data)
        print("🔍 DEBUG: User:", self.request.user)
        print("🔍 DEBUG: User authenticated:", self.request.user.is_authenticated)
        
        # For testing, allow creation without any user/pharmacy requirements
        # Just save the basic sale without additional fields
        
        print("🔍 DEBUG: About to save sale...")
        
        try:
            # Save without served_by and pharmacy for now
            sale = serializer.save()
            print("✅ DEBUG: Sale created successfully with ID:", sale.id)
        except Exception as e:
            print(f"❌ DEBUG: Error creating sale: {str(e)}")
            print(f"❌ DEBUG: Error type: {type(e)}")
            raise

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
        
        # For basic pharmacists, allow access to all customers
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            return Customer.objects.all().select_related('user')
        
        if hasattr(user, 'pharmacy'):
            # Return all customers - they're not directly linked to pharmacy
            return Customer.objects.all().select_related('user')
        return Customer.objects.none()

    def perform_create(self, serializer):
        serializer.save()
class CustomerDetailView(generics.RetrieveAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Customer.objects.select_related('user')

class CustomerSalesListView(generics.ListAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    
    def get_queryset(self):
        customer_id = self.kwargs['customer_id']
        customer = get_object_or_404(Customer, id=customer_id)
        return Sale.objects.filter(customer=customer).select_related(
            'served_by', 'pharmacy'
        ).prefetch_related('items')

class CustomerPaymentsListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager,CanManageCustomers]
    
    def get_queryset(self):
        customer_id = self.kwargs['customer_id']
        customer = get_object_or_404(Customer, id=customer_id)
        return Payment.objects.filter(sale__customer=customer).select_related(
            'sale', 'sale__served_by'
        )
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