# sales/serializers.py
from rest_framework import serializers
from django.db import transaction
from django.db import models
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
    medicine_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = SaleItem
        fields = ['medicine_id', 'quantity', 'unit_price']
        # Removed pharmacy_medicine from fields since we'll set it programmatically
        
    def validate(self, data):
        # Convert medicine_id to pharmacy_medicine
        medicine_id = data.get('medicine_id')
        if not medicine_id:
            raise serializers.ValidationError({'medicine_id': 'This field is required.'})
            
        try:
            # For now, get the first PharmacyMedicine for this medicine
            # In production, you'd filter by the current user's pharmacy
            from Pharmacy.models import PharmacyMedicine, Pharmacy
            pharmacy_medicine = PharmacyMedicine.objects.filter(
                medicine_id=medicine_id
            ).first()
            
            if pharmacy_medicine:
                # Replace medicine_id with pharmacy_medicine in validated data
                data['pharmacy_medicine'] = pharmacy_medicine
                # Remove medicine_id since it's not needed in the final data
                data.pop('medicine_id', None)
            else:
                # Get medicine name for better error message
                from Medicine.models import Medicine
                try:
                    medicine = Medicine.objects.get(id=medicine_id)
                    
                    # Auto-create PharmacyMedicine with 0 stock for better UX
                    pharmacy = Pharmacy.objects.first()  # Get default pharmacy
                    if pharmacy:
                        pharmacy_medicine = PharmacyMedicine.objects.create(
                            medicine=medicine,
                            pharmacy=pharmacy,
                            quantity=0
                        )
                        # Now raise stock error since quantity is 0
                        raise serializers.ValidationError({
                            'stock_error': f"Le médicament '{medicine.nom}' a été ajouté à l'inventaire mais est en rupture de stock (0 unités disponibles)."
                        })
                    else:
                        raise serializers.ValidationError({
                            'stock_error': f"Le médicament '{medicine.nom}' n'est pas disponible dans cette pharmacie. Veuillez l'ajouter à l'inventaire d'abord."
                        })
                except Medicine.DoesNotExist:
                    raise serializers.ValidationError({
                        'stock_error': f"Médicament avec ID {medicine_id} introuvable."
                    })
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise
            raise serializers.ValidationError({'error': f"Error finding medicine: {str(e)}"})
        
        # Validate stock availability
        if 'pharmacy_medicine' in data and 'quantity' in data:
            pharmacy_medicine = data['pharmacy_medicine']
            requested_quantity = data['quantity']
            available_stock = pharmacy_medicine.quantity
            
            if available_stock <= 0:
                raise serializers.ValidationError({
                    'stock_error': f"Le médicament '{pharmacy_medicine.medicine.nom}' est en rupture de stock."
                })
            
            if requested_quantity > available_stock:
                raise serializers.ValidationError({
                    'stock_error': f"Stock insuffisant pour '{pharmacy_medicine.medicine.nom}'. "
                                 f"Demandé: {requested_quantity}, Disponible: {available_stock}"
                })
        
        return data

class SaleSerializer(serializers.ModelSerializer):
    served_by_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    items = SaleItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()  # Use method instead of direct field
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'created_at', 'total_amount', 'total', 'served_by_name', 'items', 
            'customer', 'customer_name', 'customer_phone', 'items_count', 'reference'
        ]
    
    def get_total(self, obj):
        """Calculate total dynamically from items to ensure it's correct"""
        try:
            items = obj.items.all()
            calculated_total = sum(item.subtotal for item in items)
            return calculated_total
        except Exception as e:
            # Return the stored total_amount if calculation fails
            return obj.total_amount or 0
    
    def get_served_by_name(self, obj):
        if obj.served_by:
            return f"{obj.served_by.first_name} {obj.served_by.last_name}"
        return None
    
    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip()
        return "Walk-in Customer"
    
    def get_customer_phone(self, obj):
        if obj.customer and obj.customer.phone:
            return obj.customer.phone
        return None
    
    def get_items_count(self, obj):
        return obj.items.count()

class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'customer', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Set default pharmacy (for now, use the first pharmacy)
        # In production, you'd get this from the current user's pharmacy
        from Pharmacy.models import Pharmacy
        default_pharmacy = Pharmacy.objects.first()
        if not default_pharmacy:
            raise serializers.ValidationError({
                'pharmacy_error': 'Aucune pharmacie trouvée dans le système.'
            })
        
        validated_data['pharmacy'] = default_pharmacy
        
        # Set served_by to current user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['served_by'] = request.user
        
        # Validate all items have sufficient stock before creating anything
        for item_data in items_data:
            pharmacy_medicine = item_data['pharmacy_medicine']
            requested_quantity = item_data['quantity']
            
            if pharmacy_medicine.quantity < requested_quantity:
                raise serializers.ValidationError({
                    'stock_error': f"Stock insuffisant pour '{pharmacy_medicine.medicine.nom}'. "
                                 f"Demandé: {requested_quantity}, Disponible: {pharmacy_medicine.quantity}"
                })
        
        # Use transaction to ensure data consistency
        with transaction.atomic():
            sale = Sale.objects.create(**validated_data)
            
            # Create sale items and reduce stock
            for item_data in items_data:
                # Create sale item with explicit subtotal calculation
                sale_item = SaleItem(
                    sale=sale,
                    pharmacy_medicine=item_data['pharmacy_medicine'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
                # Explicitly calculate subtotal before saving
                sale_item.subtotal = sale_item.quantity * sale_item.unit_price
                sale_item.save()
                
                print(f"Created SaleItem: {sale_item.pharmacy_medicine.medicine.nom} - Qty: {sale_item.quantity}, Price: {sale_item.unit_price}, Subtotal: {sale_item.subtotal}")
                
                # Reduce stock using the model's method
                pharmacy_medicine = item_data['pharmacy_medicine']
                success = pharmacy_medicine.reduce_stock(
                    amount=item_data['quantity'],
                    user=request.user if request and request.user.is_authenticated else None,
                    reason="SALE",
                    reference_transaction=sale
                )
                
                if not success:
                    raise serializers.ValidationError({
                        'stock_error': f"Échec de la réduction du stock pour '{pharmacy_medicine.medicine.nom}'"
                    })
        
        # Calculate total using the model's method
        print(f"Updating totals for sale {sale.id}")
        sale.update_totals()
        print(f"Sale total after update: {sale.total_amount}")
        
        return sale

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    balance = serializers.SerializerMethodField()
    available_credit = serializers.SerializerMethodField()
    total_purchases = serializers.SerializerMethodField()
    def get_balance(self, obj):
        try:
            # Get current user's pharmacy from context
            request = self.context.get('request')
            if request and hasattr(request.user, 'pharmacy') and request.user.pharmacy:
                pharmacy = request.user.pharmacy
                
                # Calculate balance only for sales at this pharmacy
                from decimal import Decimal
                total_sales = Sale.objects.filter(
                    customer=obj, 
                    pharmacy=pharmacy
                ).aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0.00')
                
                total_payments = Payment.objects.filter(
                    sale__customer=obj,
                    sale__pharmacy=pharmacy
                ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
                
                return float(total_sales - total_payments)
            return 0.0
        except Exception:
            return 0.0

    def get_available_credit(self, obj):
        try:
            # Calculate available credit based on pharmacy-specific balance
            balance = self.get_balance(obj)
            return float(obj.credit_limit - balance)
        except Exception:
            return 0.0

    def get_total_purchases(self, obj):
        try:
            # Get current user's pharmacy from context
            request = self.context.get('request')
            if request and hasattr(request.user, 'pharmacy') and request.user.pharmacy:
                pharmacy = request.user.pharmacy
                
                # Calculate total purchases only for this pharmacy
                from decimal import Decimal
                total = Sale.objects.filter(
                    customer=obj,
                    pharmacy=pharmacy
                ).aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0.00')
                
                return float(total)
            return 0.0
        except Exception:
            return 0.0
    sales_count = serializers.SerializerMethodField()
    last_purchase_date = serializers.SerializerMethodField()
    
    def get_sales_count(self, obj):
        try:
            # Get current user's pharmacy from context
            request = self.context.get('request')
            if request and hasattr(request.user, 'pharmacy') and request.user.pharmacy:
                pharmacy = request.user.pharmacy
                return Sale.objects.filter(customer=obj, pharmacy=pharmacy).count()
            return 0
        except Exception:
            return 0
    
    def get_last_purchase_date(self, obj):
        try:
            # Get current user's pharmacy from context
            request = self.context.get('request')
            if request and hasattr(request.user, 'pharmacy') and request.user.pharmacy:
                pharmacy = request.user.pharmacy
                last_sale = Sale.objects.filter(
                    customer=obj, 
                    pharmacy=pharmacy
                ).order_by('-created_at').first()
                return last_sale.created_at if last_sale else None
            return None
        except Exception:
            return None
    full_name = serializers.SerializerMethodField()
    
    # Fields for creating customer with user
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'phone', 'address', 'credit_limit', 'balance', 
            'available_credit', 'total_purchases', 'sales_count', 'last_purchase_date',
            'created_at', 'updated_at', 'is_active', 'notes', 'full_name',
            # Write-only fields for creation
            'username', 'email', 'first_name', 'last_name', 'password'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Get customer's full name"""
        if obj.user:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return name if name else obj.user.username
        return "Unknown Customer"
    
    def create(self, validated_data):
        # Extract user data
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        password = validated_data.pop('password', None)
        
        # Validate required fields for new customer
        if not username and not email:
            raise serializers.ValidationError({
                'username': 'Either username or email is required'
            })
        
        # Generate username from email if not provided
        if not username and email:
            username = email.split('@')[0]
            # Ensure username is unique
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
        
        # Generate default password if not provided
        if not password:
            import secrets
            import string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email or f"{username}@pharmacy.local",
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        
        # Create customer
        customer = Customer.objects.create(user=user, **validated_data)
        return customer
    
    def update(self, instance, validated_data):
        # Handle user field updates
        user_fields = ['username', 'email', 'first_name', 'last_name']
        user_data = {}
        
        for field in user_fields:
            if field in validated_data:
                user_data[field] = validated_data.pop(field)
        
        # Update user if there's user data
        if user_data and instance.user:
            for field, value in user_data.items():
                setattr(instance.user, field, value)
            instance.user.save()
        
        # Update customer
        return super().update(instance, validated_data)
