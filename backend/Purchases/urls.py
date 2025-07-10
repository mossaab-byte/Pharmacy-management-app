from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, PurchaseViewSet, record_supplier_payment

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'purchases', PurchaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('suppliers/<uuid:supplier_id>/payments/', record_supplier_payment, name='record_supplier_payment'),
]
