from rest_framework import serializers
from .models import Pharmacy, PharmacyMedicine
from Medicine.serializers import MedicineSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *
from Pharmacy.models import Pharmacy  # or adjust import path if needed

User = get_user_model()
class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = '__all__'
        read_only_fields = ('created_at',)



class PharmacyMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.nom', read_only=True)
    medicine_code = serializers.CharField(source='medicine.code', read_only=True)
    medicine_form = serializers.CharField(source='medicine.forme', read_only=True)
    medicine_dosage = serializers.CharField(source='medicine.dosage1', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)

    class Meta:
        model = PharmacyMedicine
        fields = [
            'id', 'medicine', 'pharmacy', 'quantity', 'minimum_stock_level',
            'medicine_name', 'medicine_code', 'medicine_form', 'medicine_dosage',
            'pharmacy_name', 'price', 'cost_price', 'last_updated', 'units_sold'
        ]
        read_only_fields = ['last_updated', 'units_sold']

class StockAdjustmentSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(max_length=255, default="ADJUSTMENT")


class BulkPharmacyMedicineSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    reason = serializers.CharField()




User = get_user_model()

class ManagerSerializer(serializers.ModelSerializer):
    pharmacy_id = serializers.UUIDField(write_only=True)  # For create operations
    user_id = serializers.UUIDField(write_only=True)  # For create operations

    class Meta:
        model = Manager
        fields = [
            'id',
            'user_id',
            'pharmacy_id',
            'can_modify_sales',
            'can_delete_sales',
            'can_modify_purchases',
            'can_delete_purchases',
            'can_view_reports',
            'can_manage_inventory',
            'can_manage_customers',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'granted_by']

    def create(self, validated_data):
        # Extract IDs and convert to actual objects
        user_id = validated_data.pop('user_id')
        pharmacy_id = validated_data.pop('pharmacy_id')
        
        # Get objects from database
        user = User.objects.get(id=user_id)
        pharmacy = Pharmacy.objects.get(id=pharmacy_id)  # Import your Pharmacy model
        
        # Get granting pharmacist from request
        granted_by = self.context['request'].user
        
        # Create manager permission record
        manager = Manager.objects.create(
            user=user,
            pharmacy=pharmacy,
            granted_by=granted_by,
            **validated_data
        )
        return manager