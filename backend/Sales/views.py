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
    permission_classes = [permissions.IsAuthenticated, IsPharmacistOrManager, CanModifySales, CanDeleteSales]

    def get_queryset(self):
        user = self.request.user
        
        # For basic pharmacists without a specific pharmacy, return all sales
        # (in a production environment, you might want to create a default pharmacy)
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            if hasattr(user, 'pharmacy') and user.pharmacy:
                return Sale.objects.filter(pharmacy=user.pharmacy).order_by('-created_at')
            else:
                # Basic pharmacist - return all sales for now
                return Sale.objects.all().order_by('-created_at')
        
        return Sale.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer

    def perform_create(self, serializer):
        # Automatically set served_by to current user
        # For basic pharmacists without a pharmacy, set pharmacy to None or create a default one
        user_pharmacy = getattr(self.request.user, 'pharmacy', None)
        serializer.save(
            served_by=self.request.user,
            pharmacy=user_pharmacy
        )

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