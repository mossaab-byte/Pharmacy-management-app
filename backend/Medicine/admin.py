from django.contrib import admin
from .models import Medicine

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['nom', 'code', 'dci1', 'forme', 'ppv', 'princeps_generique', 'type']
    list_filter = ['princeps_generique', 'type', 'forme']
    search_fields = ['nom', 'code', 'dci1']
    readonly_fields = []

# Note: Additional medicine models (MedicineCategory, Manufacturer, etc.) 
# will be added in future migrations as the system evolves
