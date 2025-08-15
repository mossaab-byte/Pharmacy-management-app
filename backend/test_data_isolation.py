#!/usr/bin/env python
"""
Test script to verify that sales data is properly isolated by pharmacy
"""
import os
import sys
import django

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy
from Sales.models import Customer, Sale
from django.test import RequestFactory
from Sales.views import SalesViewSet, CustomerViewSet

User = get_user_model()

def test_data_isolation():
    print("🔍 Testing Sales Data Isolation")
    print("=" * 50)
    
    # Get all pharmacies
    pharmacies = Pharmacy.objects.all()
    print(f"📊 Total pharmacies in system: {pharmacies.count()}")
    
    for pharmacy in pharmacies:
        print(f"\n🏥 Pharmacy: {pharmacy.name}")
        
        # Get users for this pharmacy
        users = User.objects.filter(pharmacy=pharmacy)
        if users.exists():
            user = users.first()
            print(f"👤 Testing with user: {user.username}")
            
            # Create a mock request
            factory = RequestFactory()
            request = factory.get('/api/sales/')
            request.user = user
            
            # Test SalesViewSet
            sales_view = SalesViewSet()
            sales_view.request = request
            sales_queryset = sales_view.get_queryset()
            print(f"💰 Sales visible to this user: {sales_queryset.count()}")
            
            # Test CustomerViewSet
            customer_view = CustomerViewSet()
            customer_view.request = request
            customer_queryset = customer_view.get_queryset()
            print(f"👥 Customers visible to this user: {customer_queryset.count()}")
            
            # Check if sales belong to correct pharmacy
            wrong_pharmacy_sales = sales_queryset.exclude(pharmacy=pharmacy)
            if wrong_pharmacy_sales.exists():
                print(f"❌ SECURITY ISSUE: {wrong_pharmacy_sales.count()} sales from other pharmacies visible!")
            else:
                print("✅ All sales belong to correct pharmacy")
        else:
            print(f"⚠️  No users found for pharmacy {pharmacy.name}")
    
    print("\n🔍 Cross-pharmacy data check:")
    all_sales = Sale.objects.all()
    print(f"📊 Total sales in system: {all_sales.count()}")
    
    # Check pharmacy distribution
    for pharmacy in pharmacies:
        pharmacy_sales = all_sales.filter(pharmacy=pharmacy)
        print(f"🏥 {pharmacy.name}: {pharmacy_sales.count()} sales")

if __name__ == "__main__":
    test_data_isolation()
