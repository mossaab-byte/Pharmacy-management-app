#!/usr/bin/env python
"""
Comprehensive API Test and Data Setup Script
Tests both Sales and Inventory endpoints and creates test data if needed.
"""

import os
import django
import sys
import json
from django.core.management import call_command

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine
from Sales.models import Sale, SaleItem, Customer
from django.db import transaction
from decimal import Decimal

User = get_user_model()

def test_api_endpoints():
    """Test API endpoints and create basic data"""
    print("\n🧪 COMPREHENSIVE API TEST")
    print("=" * 50)
    
    # Test 1: Check if any users exist
    user_count = User.objects.count()
    print(f"👤 Users in database: {user_count}")
    
    if user_count == 0:
        print("❌ No users found. Creating test user...")
        user = User.objects.create_user(
            username='testpharmacist',
            email='test@pharmacy.com',
            password='testpass123',
            first_name='Test',
            last_name='Pharmacist'
        )
    else:
        user = User.objects.first()
        print(f"✅ Using existing user: {user.username}")
    
    # Test 2: Check pharmacy
    pharmacy_count = Pharmacy.objects.count()
    print(f"🏥 Pharmacies in database: {pharmacy_count}")
    
    if pharmacy_count == 0:
        print("❌ No pharmacy found. Creating test pharmacy...")
        pharmacy = Pharmacy.objects.create(
            name='Test Pharmacy',
            address='123 Test Street',
            phone='0123456789',
            email='pharmacy@test.com'
        )
    else:
        pharmacy = Pharmacy.objects.first()
        print(f"✅ Using existing pharmacy: {pharmacy.name}")
    
    # Test 3: Check medicines
    medicine_count = Medicine.objects.count()
    print(f"💊 Medicines in database: {medicine_count}")
    
    if medicine_count == 0:
        print("❌ No medicines found. Creating test medicines...")
        medicines = [
            {
                'nom': 'Paracetamol 500mg',
                'code': 'PAR500',
                'prix': '15.50',
                'forme': 'Comprimé',
                'dosage': '500mg'
            },
            {
                'nom': 'Amoxicilline 250mg',
                'code': 'AMO250',
                'prix': '25.00',
                'forme': 'Gélule',
                'dosage': '250mg'
            },
            {
                'nom': 'Ibuprofen 400mg',
                'code': 'IBU400',
                'prix': '20.00',
                'forme': 'Comprimé',
                'dosage': '400mg'
            }
        ]
        
        created_medicines = []
        for med_data in medicines:
            medicine = Medicine.objects.create(**med_data)
            created_medicines.append(medicine)
        print(f"✅ Created {len(created_medicines)} test medicines")
    else:
        created_medicines = list(Medicine.objects.all()[:3])
        print(f"✅ Using existing medicines: {[m.nom for m in created_medicines]}")
    
    # Test 4: Check inventory (PharmacyMedicine)
    inventory_count = PharmacyMedicine.objects.count()
    print(f"📦 Inventory items in database: {inventory_count}")
    
    if inventory_count == 0:
        print("❌ No inventory found. Creating test inventory...")
        for medicine in created_medicines:
            PharmacyMedicine.objects.create(
                medicine=medicine,
                pharmacy=pharmacy,
                quantity=100,
                minimum_stock_level=10,
                price=Decimal(medicine.prix) if medicine.prix else Decimal('10.00')
            )
        print(f"✅ Created inventory for {len(created_medicines)} medicines")
    else:
        print(f"✅ Inventory exists with {inventory_count} items")
    
    # Test 5: Check customers
    customer_count = Customer.objects.count()
    print(f"👥 Customers in database: {customer_count}")
    
    if customer_count == 0:
        print("❌ No customers found. Creating test customer...")
        test_customer_user = User.objects.create_user(
            username='testcustomer',
            email='customer@test.com',
            first_name='Test',
            last_name='Customer'
        )
        customer = Customer.objects.create(
            user=test_customer_user,
            phone='0987654321',
            address='456 Customer Street',
            emergency_contact='0555666777'
        )
    else:
        customer = Customer.objects.first()
        print(f"✅ Using existing customer: {customer.user.get_full_name()}")
    
    # Test 6: Check sales
    sales_count = Sale.objects.count()
    print(f"💰 Sales in database: {sales_count}")
    
    if sales_count < 3:  # Create some test sales
        print(f"📈 Creating test sales...")
        with transaction.atomic():
            inventory_items = list(PharmacyMedicine.objects.all()[:3])
            
            for i, inventory_item in enumerate(inventory_items):
                sale = Sale.objects.create(
                    customer=customer,
                    pharmacy=pharmacy,
                    served_by=user,
                    total_amount=Decimal('0.00')  # Will be updated
                )
                
                # Create sale items
                quantity = 2
                unit_price = inventory_item.price
                subtotal = quantity * unit_price
                
                sale_item = SaleItem.objects.create(
                    sale=sale,
                    pharmacy_medicine=inventory_item,
                    quantity=quantity,
                    unit_price=unit_price,
                    subtotal=subtotal
                )
                
                # Update sale total
                sale.total_amount = subtotal
                sale.save()
                
                # Update stock
                inventory_item.quantity -= quantity
                inventory_item.save()
                
                print(f"   ✅ Created sale #{sale.reference} for {inventory_item.medicine.nom}")
    else:
        print(f"✅ Sales exist: {sales_count} sales in database")
    
    print("\n🔍 FINAL DATABASE STATUS")
    print("=" * 30)
    print(f"👤 Users: {User.objects.count()}")
    print(f"🏥 Pharmacies: {Pharmacy.objects.count()}")
    print(f"💊 Medicines: {Medicine.objects.count()}")
    print(f"📦 Inventory Items: {PharmacyMedicine.objects.count()}")
    print(f"👥 Customers: {Customer.objects.count()}")
    print(f"💰 Sales: {Sale.objects.count()}")
    print(f"🛒 Sale Items: {SaleItem.objects.count()}")
    
    # Test serialization
    print("\n🔗 API SERIALIZATION TEST")
    print("=" * 25)
    
    try:
        from Sales.serializers import SaleSerializer
        from Inventory.serializers import PharmacyMedicineSerializer
        
        # Test sales serialization
        sales = Sale.objects.all()[:3]
        if sales:
            sales_data = SaleSerializer(sales, many=True).data
            print(f"✅ Sales serialization: {len(sales_data)} sales serialized successfully")
            if sales_data:
                print(f"   Sample sale total: {sales_data[0].get('total', 'N/A')}")
        else:
            print("❌ No sales to test serialization")
        
        # Test inventory serialization
        inventory = PharmacyMedicine.objects.all()[:3]
        if inventory:
            inventory_data = PharmacyMedicineSerializer(inventory, many=True).data
            print(f"✅ Inventory serialization: {len(inventory_data)} items serialized successfully")
            if inventory_data:
                print(f"   Sample item: {inventory_data[0].get('medicine', {}).get('nom', 'N/A')}")
        else:
            print("❌ No inventory to test serialization")
            
    except Exception as e:
        print(f"❌ Serialization test failed: {str(e)}")
    
    print("\n✅ Setup complete! You can now test the API endpoints.")
    print("📍 Try these URLs:")
    print("   - http://localhost:8000/api/sales/sales/")
    print("   - http://localhost:8000/api/pharmacy/pharmacy-medicines/")
    print("   - http://localhost:3000/inventory")
    print("   - http://localhost:3000/sales")
    print("   - http://localhost:3000/debug/backend")

if __name__ == '__main__':
    try:
        test_api_endpoints()
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        import traceback
        traceback.print_exc()
