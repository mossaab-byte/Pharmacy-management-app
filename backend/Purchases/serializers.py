
from django.db import transaction

from rest_framework import serializers
from .models import *
from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ['pharmacy']

class PurchaseItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.nom', read_only=True)
    medicine_id = serializers.PrimaryKeyRelatedField(queryset=Medicine.objects.all(), source='medicine')
    medicine = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = ['id', 'medicine_id', 'medicine_name', 'medicine', 'quantity', 'unit_cost', 'subtotal']
        read_only_fields = ['id', 'subtotal']

    def get_medicine(self, obj):
        """Return medicine details for frontend display"""
        if obj.medicine:
            return {
                'id': obj.medicine.id,
                'nom': obj.medicine.nom,
                'nom_commercial': obj.medicine.nom,  # Use nom as nom_commercial for compatibility
                'code': obj.medicine.code,
                'dci1': obj.medicine.dci1,
                'forme': obj.medicine.forme,
                'presentation': obj.medicine.presentation,
                'princeps_generique': obj.medicine.princeps_generique,
            }
        return None

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
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    total = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2, read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)
    items_count = serializers.SerializerMethodField()
    status = serializers.CharField(default='pending', read_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'pharmacy', 'supplier', 'supplier_id', 'supplier_name', 'total_amount', 'total', 'date', 'created_at', 'received_by', 'items', 'items_count', 'status']
        read_only_fields = ['id', 'pharmacy', 'total_amount', 'total', 'date', 'created_at', 'received_by', 'items_count', 'status']

    def get_items_count(self, obj):
        return obj.items.count()

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        with transaction.atomic():
            purchase = Purchase.objects.create(**validated_data)
            print(f"🔍 Created purchase: {purchase.id}")
            print(f"🔍 Initial total_amount: {purchase.total_amount}")
            
            # Create purchase items
            total_calculated = 0
            for item_data in items_data:
                item = PurchaseItem.objects.create(purchase=purchase, **item_data)
                print(f"🔍 Created item: {item.quantity} x {item.medicine.nom} @ {item.unit_cost} = {item.subtotal}")
                total_calculated += item.subtotal
            
            # Calculate and save total
            total_from_db = sum(item.subtotal for item in purchase.items.all())
            purchase.total_amount = total_from_db
            purchase.save()
            
            print(f"🔍 Calculated total: {total_calculated}")
            print(f"🔍 DB query total: {total_from_db}")
            print(f"🔍 Final purchase total_amount: {purchase.total_amount}")
            
            # Finalize purchase (update inventory and supplier balance)
            purchase.finalize()
            
            # Refresh from database to get the final state
            purchase.refresh_from_db()
            print(f"🔍 After finalize total_amount: {purchase.total_amount}")
            
        return purchase

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        with transaction.atomic():
            # Store old total for supplier balance adjustment
            old_total = instance.total_amount
            old_supplier = instance.supplier
            print(f"🔍 Updating purchase {instance.id}: old_total={old_total}, old_supplier={old_supplier.name}")
            
            # 1. First, reverse the old purchase effects
            # Remove old supplier transaction
            old_transactions = SupplierTransaction.objects.filter(reference=str(instance.id))
            old_transactions_count = old_transactions.count()
            old_transactions.delete()
            print(f"🔍 Removed {old_transactions_count} old supplier transactions")
            
            # Reverse old inventory changes
            for old_item in instance.items.all():
                try:
                    from Pharmacy.models import PharmacyMedicine
                    pm = PharmacyMedicine.objects.get(
                        pharmacy=instance.pharmacy,
                        medicine=old_item.medicine
                    )
                    # Subtract the old quantity
                    old_quantity = pm.quantity
                    pm.quantity -= old_item.quantity
                    if pm.quantity < 0:
                        pm.quantity = 0  # Don't allow negative quantities
                    pm.save()
                    print(f"🔍 Reversed inventory: {old_item.medicine.nom} from {old_quantity} to {pm.quantity} (-{old_item.quantity})")
                except:
                    print(f"⚠️ Could not reverse inventory for {old_item.medicine.nom}")
            
            # 2. Update basic purchase fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # 3. Clear existing items and create new ones
            instance.items.all().delete()
            
            total_calculated = 0
            for item_data in items_data:
                item = PurchaseItem.objects.create(purchase=instance, **item_data)
                print(f"🔍 Updated item: {item.quantity} x {item.medicine.nom} @ {item.unit_cost} = {item.subtotal}")
                total_calculated += item.subtotal
            
            # 4. Calculate and save new total
            total_from_db = sum(item.subtotal for item in instance.items.all())
            instance.total_amount = total_from_db
            instance.save()
            
            print(f"🔍 Updated total: {total_calculated}")
            print(f"🔍 Final updated total_amount: {instance.total_amount}")
            
            # 5. Apply new purchase effects (finalize the updated purchase)
            instance.finalize()
            
            # 6. Update old supplier balance if supplier changed
            if old_supplier != instance.supplier:
                print(f"🔍 Supplier changed from {old_supplier.name} to {instance.supplier.name}")
                old_supplier.update_balance()
            
            # Refresh from database to get the final state
            instance.refresh_from_db()
            
        return instance

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