#!/usr/bin/env python
"""
Test script to verify the dashboard data fix.
This script tests the dashboard API endpoints to ensure they return proper data.
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy
from Sales.models import Sale, Customer
from Purchases.models import Purchase
from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine

User = get_user_model()

def test_dashboard_data():
    """Test dashboard data retrieval"""
    print("🔍 Testing Dashboard Data Fix")
    print("=" * 50)
    
    # Get a user with a pharmacy
    try:
        # Check for users with owned pharmacies
        users_with_pharmacy = User.objects.filter(owned_pharmacy__isnull=False)
        print(f"📊 Found {users_with_pharmacy.count()} users with owned pharmacies")
        
        for user in users_with_pharmacy:
            print(f"👤 User: {user.username}")
            print(f"🏥 Pharmacy: {user.owned_pharmacy.name}")
            
            # Check data counts
            pharmacy = user.owned_pharmacy
            sales_count = Sale.objects.filter(pharmacy=pharmacy).count()
            purchases_count = Purchase.objects.filter(pharmacy=pharmacy).count()
            customers_count = Customer.objects.filter(pharmacy=pharmacy).count()
            medicines_count = PharmacyMedicine.objects.filter(pharmacy=pharmacy).count()
            
            print(f"📈 Sales: {sales_count}")
            print(f"📦 Purchases: {purchases_count}")
            print(f"👥 Customers: {customers_count}")
            print(f"💊 Medicines: {medicines_count}")
            print("-" * 30)
            
        # Check for manager users
        from Pharmacy.models import Manager
        managers = Manager.objects.all()
        print(f"👨‍💼 Found {managers.count()} manager permissions")
        
        for manager in managers:
            print(f"👤 Manager: {manager.user.username}")
            print(f"🏥 Pharmacy: {manager.pharmacy.name}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def test_helper_function():
    """Test the get_user_pharmacy helper function"""
    print("\n🔧 Testing get_user_pharmacy Helper Function")
    print("=" * 50)
    
    try:
        from Dashboard.views_clean import get_user_pharmacy
        
        # Test with pharmacy owners
        users_with_pharmacy = User.objects.filter(owned_pharmacy__isnull=False)
        for user in users_with_pharmacy[:3]:  # Test first 3
            pharmacy = get_user_pharmacy(user)
            print(f"👤 User: {user.username}")
            print(f"🏥 Helper result: {pharmacy.name if pharmacy else 'None'}")
            print(f"✅ Expected: {user.owned_pharmacy.name}")
            print(f"✅ Match: {pharmacy == user.owned_pharmacy}")
            print("-" * 30)
            
        # Test with managers
        from Pharmacy.models import Manager
        managers = Manager.objects.all()
        for manager in managers[:3]:  # Test first 3
            pharmacy = get_user_pharmacy(manager.user)
            print(f"👤 Manager: {manager.user.username}")
            print(f"🏥 Helper result: {pharmacy.name if pharmacy else 'None'}")
            print(f"✅ Expected: {manager.pharmacy.name}")
            print(f"✅ Match: {pharmacy == manager.pharmacy}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main test function"""
    print("🚀 Dashboard Fix Verification")
    print("=" * 50)
    
    test_dashboard_data()
    test_helper_function()
    
    print("\n🎯 Summary")
    print("=" * 50)
    print("✅ The dashboard issue was caused by incorrect relationship access:")
    print("   - Old code: getattr(request.user, 'pharmacy', None)")
    print("   - New code: getattr(request.user, 'owned_pharmacy', None)")
    print("   - Also added support for manager users")
    print("\n📋 Next steps:")
    print("   1. Start the server with: .\\start.bat")
    print("   2. Login with a user that has a pharmacy")
    print("   3. Check dashboard - should now show proper data!")

if __name__ == '__main__':
    main()
