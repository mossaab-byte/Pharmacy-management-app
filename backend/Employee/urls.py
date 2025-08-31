from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, EmployeeRoleViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'roles', EmployeeRoleViewSet, basename='employee-role')

app_name = 'employee'

urlpatterns = [
    path('api/', include(router.urls)),
]
