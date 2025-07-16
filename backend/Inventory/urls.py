from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryLogViewSet

router = DefaultRouter()
router.register(r'logs', InventoryLogViewSet, basename='inventory-logs')

urlpatterns = [
    path('', include(router.urls)),
    path('', include('Inventory.stock_urls')),
]
