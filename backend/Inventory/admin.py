from django.contrib import admin
from .models import InventoryLog

@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ['pharmacy_medicine', 'transaction_type', 'quantity_changed', 'old_quantity', 'new_quantity', 'reason', 'timestamp']
    list_filter = ['transaction_type', 'reason', 'timestamp']
    search_fields = ['pharmacy_medicine__medicine__nom', 'pharmacy_medicine__pharmacy__name']
    readonly_fields = ['timestamp']
    
# Note: Advanced inventory models will be imported when they are created
