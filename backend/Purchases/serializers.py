
from django.db import transaction

from rest_framework import serializers
from .models import *
from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_id = serializers.PrimaryKeyRelatedField(queryset=Medicine.objects.all(), source='medicine')

    class Meta:
        model = PurchaseItem
        fields = ['id', 'medicine_id', 'medicine_name', 'quantity', 'unit_cost', 'subtotal', 'expiry_date', 'batch_number']
        read_only_fields = ['id', 'subtotal']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value

    def validate_unit_cost(self, value):
        if value <= 0:
            raise serializers.ValidationError("Unit cost must be positive.")
        return value

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all(), source='supplier', write_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'pharmacy', 'supplier', 'supplier_id', 'total_amount', 'created_at', 'received_by', 'items']
        read_only_fields = ['id', 'total_amount', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        with transaction.atomic():
            purchase = Purchase.objects.create(**validated_data)
            for item_data in items_data:
                PurchaseItem.objects.create(purchase=purchase, **item_data)
            purchase.finalize()
        return purchase
class SupplierTransactionSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = SupplierTransaction
        fields = [
            'id',
            'date',
            'type',
            'amount',
            'running_balance',
            'reference',
            'created_by',
            'supplier_name',
        ]