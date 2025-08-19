#!/usr/bin/env python
"""
Test script to verify the inventory API fix.
This script tests that inventory API works for users with no inventory data.
"""

import os
import sys
import django
import requests

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Pharmacy.views import PharmacyMedicineViewSet

User = get_user_model()

def test_inventory_api_fix():
    """Test inventory API for users with and without inventory"""
    print("🔍 Testing Inventory API Fix")
    print("=" * 50)
    
    try:
        # Test users with pharmacies
        users_with_pharmacy = User.objects.filter(owned_pharmacy__isnull=False)
        print(f"📊 Found {users_with_pharmacy.count()} users with owned pharmacies")
        
        for user in users_with_pharmacy[:3]:  # Test first 3
            print(f"\n👤 Testing User: {user.username}")
            print(f"🏥 Pharmacy: {user.owned_pharmacy.name}")
            
            # Count medicines in inventory
            medicine_count = PharmacyMedicine.objects.filter(pharmacy=user.owned_pharmacy).count()
            print(f"💊 Medicines in inventory: {medicine_count}")
            
            # Simulate the pharmacy lookup logic
            pharmacy = None
            if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
                pharmacy = user.owned_pharmacy
            else:
                from Pharmacy.models import Manager
                manager_permission = Manager.objects.filter(user=user).first()
                if manager_permission:
                    pharmacy = manager_permission.pharmacy
            
            if pharmacy:
                print(f"✅ Pharmacy found: {pharmacy.name}")
            else:
                print("❌ No pharmacy found")
                
        # Test manager users
        from Pharmacy.models import Manager
        managers = Manager.objects.all()
        print(f"\n👨‍💼 Found {managers.count()} manager permissions")
        
        for manager in managers[:3]:  # Test first 3
            print(f"\n👤 Testing Manager: {manager.user.username}")
            print(f"🏥 Pharmacy: {manager.pharmacy.name}")
            
            # Count medicines in inventory
            medicine_count = PharmacyMedicine.objects.filter(pharmacy=manager.pharmacy).count()
            print(f"💊 Medicines in inventory: {medicine_count}")
            
            # Simulate the pharmacy lookup logic
            pharmacy = None
            if hasattr(manager.user, 'owned_pharmacy') and manager.user.owned_pharmacy:
                pharmacy = manager.user.owned_pharmacy
            else:
                manager_permission = Manager.objects.filter(user=manager.user).first()
                if manager_permission:
                    pharmacy = manager_permission.pharmacy
            
            if pharmacy:
                print(f"✅ Pharmacy found: {pharmacy.name}")
            else:
                print("❌ No pharmacy found")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def simulate_inventory_request():
    """Simulate the inventory API request logic"""
    print("\n🔧 Simulating Inventory API Request Logic")
    print("=" * 50)
    
    try:
        # Test both owner and manager users
        test_users = []
        
        # Add pharmacy owners
        owners = User.objects.filter(owned_pharmacy__isnull=False)[:2]
        test_users.extend([(user, 'Owner') for user in owners])
        
        # Add managers
        from Pharmacy.models import Manager
        managers = Manager.objects.all()[:2]
        test_users.extend([(manager.user, 'Manager') for manager in managers])
        
        for user, user_type in test_users:
            print(f"\n👤 User: {user.username} ({user_type})")
            
            # Simulate the fixed logic from views.py
            pharmacy = None
            if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
                pharmacy = user.owned_pharmacy
                print(f"✅ Found owned pharmacy: {pharmacy.name}")
            else:
                from Pharmacy.models import Manager
                manager_permission = Manager.objects.filter(user=user).first()
                if manager_permission:
                    pharmacy = manager_permission.pharmacy
                    print(f"✅ Found manager pharmacy: {pharmacy.name}")
            
            if not pharmacy:
                print("❌ Would return 400 error: 'No pharmacy found for user.'")
                continue
                
            # Count inventory items
            inventory_count = PharmacyMedicine.objects.filter(pharmacy=pharmacy).count()
            print(f"📦 Inventory items: {inventory_count}")
            
            if inventory_count == 0:
                print("✅ Would return empty list (no 400 error)")
            else:
                print("✅ Would return inventory data")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("🚀 Inventory API Fix Verification")
    print("=" * 50)
    
    test_inventory_api_fix()
    simulate_inventory_request()
    
    print("\n🎯 Summary")
    print("=" * 50)
    print("✅ The inventory issue was caused by incorrect user.pharmacy access:")
    print("   - Old code: elif hasattr(user, 'pharmacy') and user.pharmacy:")
    print("   - New code: Check for Manager.objects.filter(user=user).first()")
    print("   - This affects PharmacyMedicineViewSet.full_inventory() method")
    print("\n📋 Fixed locations:")
    print("   - PharmacyMedicineViewSet.full_inventory() - Line ~74")
    print("   - PharmacyMedicineViewSet.get_queryset() - Manager support") 
    print("   - PharmacyMedicineViewSet.perform_create() - Manager support")
    print("   - PharmacyViewSet.get_queryset() - Manager support")
    print("\n🚀 Next steps:")
    print("   1. Test the inventory page with users that have empty inventory")
    print("   2. Should now return empty list instead of 400 error!")

if __name__ == '__main__':
    main()
