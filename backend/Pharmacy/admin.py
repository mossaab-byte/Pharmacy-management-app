from django.contrib import admin
from .models import PharmacyMedicine

@admin.register(PharmacyMedicine)
class PharmacyMedicineAdmin(admin.ModelAdmin):
    list_display = ("id", "pharmacy", "medicine", "quantity", "price", "last_updated")
    search_fields = ("pharmacy__name", "medicine__nom")
    list_filter = ("pharmacy",)
