#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from Pharmacy.models import PharmacyMedicine, Pharmacy
from Medicine.models import Medicine
from django.contrib.auth import get_user_model

User = get_user_model()

def check_inventory_data():
    """Check what inventory data exists"""
    print("🔍 INVENTORY DATA DIAGNOSTIC")
    print("=" * 40)
    
    # Check PharmacyMedicine items
    pharmacy_medicines = PharmacyMedicine.objects.all()
    print(f"📦 Total PharmacyMedicine items: {pharmacy_medicines.count()}")
    
    if pharmacy_medicines.exists():
        print("\n📋 PharmacyMedicine items:")
        for i, pm in enumerate(pharmacy_medicines[:5]):  # Show first 5
            print(f"  {i+1}. Medicine: {pm.medicine.nom if pm.medicine else 'Unknown'}")
            print(f"      Quantity: {pm.quantity}")
            print(f"      Price: {pm.price}")
            print(f"      Pharmacy: {pm.pharmacy.name if pm.pharmacy else 'Unknown'}")
            print()
            
        if pharmacy_medicines.count() > 5:
            print(f"    ... and {pharmacy_medicines.count() - 5} more items")
    
    # Check basic medicines
    medicines = Medicine.objects.all()
    print(f"\n💊 Total Medicine items: {medicines.count()}")
    
    # Check pharmacies
    pharmacies = Pharmacy.objects.all()
    print(f"🏥 Total Pharmacies: {pharmacies.count()}")
    
    if pharmacies.exists():
        print("\n🏥 Pharmacies:")
        for pharmacy in pharmacies:
            print(f"  - {pharmacy.name} (ID: {pharmacy.id})")
            pm_count = PharmacyMedicine.objects.filter(pharmacy=pharmacy).count()
            print(f"    Inventory items: {pm_count}")
    
    # Check users
    users = User.objects.all()
    print(f"\n👥 Total Users: {users.count()}")
    
    return pharmacy_medicines.count()

def create_test_inventory():
    """Create test inventory data"""
    print("\n🚀 CREATING TEST INVENTORY")
    print("=" * 30)
    
    # Get or create a pharmacy
    try:
        user = User.objects.first()
        if not user:
            print("❌ No users found. Creating test user...")
            user = User.objects.create_user(
                username='testpharmacist',
                email='test@pharmacy.com',
                password='testpass123',
                first_name='Test',
                last_name='Pharmacist'
            )
            print(f"✅ Created test user: {user.username}")
        
        pharmacy = Pharmacy.objects.first()
        if not pharmacy:
            print("❌ No pharmacy found. Creating test pharmacy...")
            pharmacy = Pharmacy.objects.create(
                name='Test Pharmacy',
                address='123 Test Street',
                phone='0123456789',
                pharmacist=user
            )
            print(f"✅ Created test pharmacy: {pharmacy.name}")
        
        print(f"📍 Using pharmacy: {pharmacy.name}")
        
        # Test medicines data
        test_medicines = [
            {
                'nom': 'Paracetamol 500mg',
                'code': 'PAR500',
                'description': 'Pain reliever and fever reducer',
                'quantity': 150,
                'price': 5.50,
                'min_stock': 20
            },
            {
                'nom': 'Aspirin 325mg', 
                'code': 'ASP325',
                'description': 'Pain reliever and anti-inflammatory',
                'quantity': 75,
                'price': 3.25,
                'min_stock': 15
            },
            {
                'nom': 'Ibuprofen 400mg',
                'code': 'IBU400', 
                'description': 'Anti-inflammatory and pain reliever',
                'quantity': 100,
                'price': 7.80,
                'min_stock': 25
            },
            {
                'nom': 'Amoxicillin 500mg',
                'code': 'AMX500',
                'description': 'Antibiotic',
                'quantity': 50,
                'price': 12.00,
                'min_stock': 10
            },
            {
                'nom': 'Vitamin C 1000mg',
                'code': 'VITC1000',
                'description': 'Vitamin supplement',
                'quantity': 200,
                'price': 8.50,
                'min_stock': 30
            }
        ]
        
        created_count = 0
        for med_data in test_medicines:
            # Create or get medicine
            medicine, created = Medicine.objects.get_or_create(
                code=med_data['code'],
                defaults={
                    'nom': med_data['nom'],
                    'description': med_data['description'],
                    'prix_br': med_data['price'],
                    'prix_public': med_data['price'] * 1.2,
                }
            )
            
            if created:
                print(f"✅ Created medicine: {medicine.nom}")
            
            # Create or update PharmacyMedicine
            pm, pm_created = PharmacyMedicine.objects.get_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                defaults={
                    'quantity': med_data['quantity'],
                    'price': med_data['price'],
                    'cost_price': med_data['price'] * 0.8,
                    'minimum_stock_level': med_data['min_stock']
                }
            )
            
            if pm_created:
                print(f"✅ Added to pharmacy inventory: {medicine.nom} (Qty: {med_data['quantity']})")
                created_count += 1
            else:
                # Update existing
                pm.quantity = med_data['quantity']
                pm.price = med_data['price']
                pm.minimum_stock_level = med_data['min_stock']
                pm.save()
                print(f"🔄 Updated inventory: {medicine.nom} (Qty: {med_data['quantity']})")
                created_count += 1
        
        print(f"\n🎉 Successfully processed {created_count} inventory items!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating test inventory: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def test_api_serialization():
    """Test how the data appears when serialized for API"""
    print("\n🔗 API SERIALIZATION TEST")
    print("=" * 25)
    
    try:
        from Pharmacy.serializers import PharmacyMedicineSerializer
        
        pharmacy_medicines = PharmacyMedicine.objects.all()[:3]
        
        print(f"Serializing {pharmacy_medicines.count()} items...")
        
        for pm in pharmacy_medicines:
            serializer = PharmacyMedicineSerializer(pm)
            print(f"\n📦 {pm.medicine.nom if pm.medicine else 'Unknown'}:")
            print(json.dumps(serializer.data, indent=2, default=str))
        
    except Exception as e:
        print(f"❌ Serialization test failed: {str(e)}")

if __name__ == "__main__":
    # Step 1: Check existing data
    item_count = check_inventory_data()
    
    # Step 2: Create test data if none exists
    if item_count == 0:
        print("\n⚠️  No inventory data found. Creating test data...")
        create_test_inventory()
    else:
        print(f"\n✅ Found {item_count} existing inventory items")
        
        # Ask if user wants to refresh data
        response = input("\n❓ Do you want to refresh/update the test inventory data? (y/N): ").lower()
        if response == 'y':
            create_test_inventory()
    
    # Step 3: Test serialization
    test_api_serialization()
    
    # Final count
    final_count = PharmacyMedicine.objects.count()
    print(f"\n🏁 FINAL RESULT: {final_count} inventory items in database")
    print("\n🌐 Next steps:")
    print("1. Start Django server: python manage.py runserver 8000")
    print("2. Visit inventory page: http://localhost:3000/inventory")
    print("3. Visit diagnostic page: http://localhost:3000/debug/backend")
