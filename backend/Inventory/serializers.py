from rest_framework import serializers
from .models import InventoryLog

class InventoryLogSerializer(serializers.ModelSerializer):
    pharmacy_medicine_name = serializers.CharField(source='pharmacy_medicine.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = InventoryLog
        fields = '__all__'
