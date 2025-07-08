from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pharmacies', views.PharmacyViewSet)
router.register(r'managers', views.ManagerViewSet, basename='manager')
router.register(r'pharmacy-medicines', views.PharmacyMedicineViewSet, basename='pharmacymedicine')

urlpatterns = [
    path('', include(router.urls)),
]