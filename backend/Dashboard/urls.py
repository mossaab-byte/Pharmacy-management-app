from django.urls import path
from .views import (
    KpisView,
    TopProductsView,
    RevenueTrendView,
    SalesView,
    InventoryView,
)

urlpatterns = [
    path('kpis/', KpisView.as_view(), name='dashboard-kpis'),
    path('top-products/', TopProductsView.as_view(), name='dashboard-top-products'),
    path('revenue-trend/', RevenueTrendView.as_view(), name='dashboard-revenue'),
    path('sales/', SalesView.as_view(), name='dashboard-sales'),
    path('inventory/', InventoryView.as_view(), name='dashboard-inventory'),
]
