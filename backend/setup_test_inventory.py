#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from Medicine.models import Medicine
from Pharmacy.models import Pharmacy, PharmacyMedicine
from django.contrib.auth import get_user_model

User = get_user_model()

def add_test_medicines():
    """Add some test medicines to inventory for testing"""
    
    print("🧪 Adding test medicines to inventory...")
    
    # Get or create a pharmacy
    try:
        # Try to get existing pharmacy
        pharmacy = Pharmacy.objects.first()
        if not pharmacy:
            print("Creating test pharmacy...")
            # Create a test user for pharmacy
            user, created = User.objects.get_or_create(
                username='pharmacist_test',
                defaults={
                    'email': 'pharmacist@test.com',
                    'first_name': 'Test',
                    'last_name': 'Pharmacist'
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
            
            # Create pharmacy
            pharmacy = Pharmacy.objects.create(
                name='Test Pharmacy',
                address='123 Test Street',
                phone='0123456789',
                pharmacist=user
            )
            print(f"✅ Created pharmacy: {pharmacy.name}")
        else:
            print(f"✅ Using existing pharmacy: {pharmacy.name}")
    
    except Exception as e:
        print(f"❌ Error with pharmacy: {e}")
        return
    
    # Test medicines to add
    test_medicines = [
        {
            'nom': 'Paracetamol 500mg',
            'code': 'PAR500',
            'prix_public': 15.00,
            'prix_br': 12.00,
            'quantity': 100,
            'min_stock': 20
        },
        {
            'nom': 'Aspirin 325mg', 
            'code': 'ASP325',
            'prix_public': 8.50,
            'prix_br': 6.80,
            'quantity': 50,
            'min_stock': 15
        },
        {
            'nom': 'Ibuprofen 400mg',
            'code': 'IBU400', 
            'prix_public': 22.00,
            'prix_br': 18.00,
            'quantity': 75,
            'min_stock': 10
        },
        {
            'nom': 'Amoxicillin 250mg',
            'code': 'AMX250',
            'prix_public': 35.00,
            'prix_br': 28.00,
            'quantity': 30,
            'min_stock': 25
        },
        {
            'nom': 'Vitamin C 1000mg',
            'code': 'VTC1000',
            'prix_public': 45.00,
            'prix_br': 35.00,
            'quantity': 5,  # Low stock for testing
            'min_stock': 20
        }
    ]
    
    added_count = 0
    
    for med_data in test_medicines:
        try:
            # Get or create medicine
            medicine, created = Medicine.objects.get_or_create(
                code=med_data['code'],
                defaults={
                    'nom': med_data['nom'],
                    'prix_public': med_data['prix_public'],
                    'prix_br': med_data['prix_br'],
                    'forme': 'Tablet',
                    'dosage': med_data['nom'].split(' ')[-1] if ' ' in med_data['nom'] else '1',
                    'is_active': True
                }
            )
            
            if created:
                print(f"  📋 Created medicine: {medicine.nom}")
            else:
                print(f"  📋 Using existing medicine: {medicine.nom}")
            
            # Get or create pharmacy medicine (inventory entry)
            pharm_med, pm_created = PharmacyMedicine.objects.get_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                defaults={
                    'quantity': med_data['quantity'],
                    'price': med_data['prix_public'],
                    'cost_price': med_data['prix_br'],
                    'minimum_stock_level': med_data['min_stock']
                }
            )
            
            if pm_created:
                print(f"  ✅ Added to inventory: {medicine.nom} (Qty: {med_data['quantity']})")
                added_count += 1
            else:
                # Update existing inventory
                pharm_med.quantity = med_data['quantity']
                pharm_med.price = med_data['prix_public']
                pharm_med.cost_price = med_data['prix_br']
                pharm_med.minimum_stock_level = med_data['min_stock']
                pharm_med.save()
                print(f"  🔄 Updated inventory: {medicine.nom} (Qty: {med_data['quantity']})")
                added_count += 1
                
        except Exception as e:
            print(f"  ❌ Error adding {med_data['nom']}: {e}")
    
    print(f"\n🎉 Inventory setup complete!")
    print(f"   Added/Updated: {added_count} medicines")
    print(f"   Pharmacy: {pharmacy.name}")
    
    # Show current inventory
    print(f"\n📦 Current Inventory:")
    inventory = PharmacyMedicine.objects.filter(pharmacy=pharmacy)
    for item in inventory:
        status = "🔴 LOW STOCK" if item.quantity <= item.minimum_stock_level else "✅ OK"
        print(f"   {item.medicine.nom}: {item.quantity} units {status}")

if __name__ == "__main__":
    add_test_medicines()
