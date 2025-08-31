from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pharmacies', views.PharmacyViewSet)
router.register(r'managers', views.ManagerViewSet, basename='manager')
router.register(r'pharmacy-medicines', views.PharmacyMedicineViewSet, basename='pharmacymedicine')

urlpatterns = [
    path('low-stock/', views.LowStockView.as_view(), name='low-stock'),
    path('inventory-stats/', views.InventoryStatsView.as_view(), name='inventory-stats'),
    path('', include(router.urls)),
]