from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('sales', SalesViewSet, basename='sales')
router.register('customers', CustomerViewSet, basename='customers')
router.register('payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('customers/<uuid:id>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('customers/<uuid:customer_id>/sales/', CustomerSalesListView.as_view(), name='customer-sales'),
    path('customers/<uuid:customer_id>/payments/', CustomerPaymentsListView.as_view(), name='customer-payments'),
    path('pharmacy/sales/', PharmacySalesListAPIView.as_view(), name='pharmacy-sales'),
    path('', include(router.urls)),
]
