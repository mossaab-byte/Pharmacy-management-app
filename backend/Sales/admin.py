from django.contrib import admin
from .models import Sale, SaleItem, Customer, Payment

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'pharmacy', 'customer', 'total_amount', 'units_sold', 'created_at']
    list_filter = ['pharmacy', 'created_at']
    search_fields = ['customer__user__username', 'pharmacy__name']
    readonly_fields = ['id', 'created_at']

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'pharmacy_medicine', 'quantity', 'unit_price', 'subtotal']
    list_filter = ['sale__created_at']
    search_fields = ['sale__id', 'pharmacy_medicine__medicine__nom']

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'balance']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['id', 'balance']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'sale', 'amount', 'method', 'created_at']
    list_filter = ['method', 'created_at']
    search_fields = ['sale__id']
    readonly_fields = ['id', 'created_at']

# Note: Advanced sales models will be imported when they are created
