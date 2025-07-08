# sales/serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import Customer, Sale, SaleItem, Payment
from Pharmacy.models import PharmacyMedicine
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class SaleItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='pharmacy_medicine.medicine.nom')
    medicine_code = serializers.CharField(source='pharmacy_medicine.medicine.code')
    
    class Meta:
        model = SaleItem
        fields = ['id', 'medicine_name', 'medicine_code', 'quantity', 'unit_price', 'subtotal']

class PaymentSerializer(serializers.ModelSerializer):
    sale_id = serializers.UUIDField(source='sale.id', read_only=True)
    sale = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'created_at', 'method', 'sale_id', 'sale']
    
    def create(self, validated_data):
        from .models import Sale
        sale_id = validated_data.pop('sale')
        sale = Sale.objects.get(id=sale_id)
        return Payment.objects.create(sale=sale, **validated_data)

class SaleItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['pharmacy_medicine', 'quantity', 'unit_price']

class SaleSerializer(serializers.ModelSerializer):
    served_by_name = serializers.SerializerMethodField()
    items = SaleItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'created_at', 'total_amount', 'served_by_name', 'items', 'customer'
        ]
    
    def get_served_by_name(self, obj):
        if obj.served_by:
            return f"{obj.served_by.first_name} {obj.served_by.last_name}"
        return None

class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'customer', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        
        # Calculate total and finalize
        sale.finalize()
        return sale

class CustomerSerializer(serializers.ModelSerializer):
    user = CustomerUserSerializer(read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    # Fields for creating customer with user
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Customer
        fields = ['id', 'user', 'phone', 'address', 'balance', 'username', 'email', 'first_name', 'last_name']
    
    def create(self, validated_data):
        # Extract user data
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='temp123'  # Default password - should be changed
        )
        
        # Create customer
        customer = Customer.objects.create(user=user, **validated_data)
        return customer
