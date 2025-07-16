from django.urls import path
from . import stock_management

urlpatterns = [
    path('pharmacy-medicines/<int:pharmacy_medicine_id>/add-stock/', 
         stock_management.add_stock, name='add-stock'),
    path('pharmacy-medicines/<int:pharmacy_medicine_id>/reduce-stock/', 
         stock_management.reduce_stock, name='reduce-stock'),
    path('user/permissions/', 
         stock_management.get_user_permissions, name='user-permissions'),
]
