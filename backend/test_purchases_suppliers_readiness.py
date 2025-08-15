#!/usr/bin/env python
"""
Comprehensive test for purchases and suppliers modules to ensure they're production-ready
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
from django.test import RequestFactory
from Pharmacy.models import Pharmacy
from Purchases.models import Supplier, Purchase, PurchaseItem, SupplierTransaction
from Purchases.views import SupplierViewSet, PurchaseViewSet
from rest_framework.test import APIRequestFactory

User = get_user_model()

def test_purchases_suppliers_readiness():
    print("🛒 Testing Purchases & Suppliers Module Readiness")
    print("=" * 60)
    
    # 1. Test data isolation
    print("\n1. 🔒 Data Isolation Test")
    pharmacies = Pharmacy.objects.all()
    print(f"📊 Total pharmacies: {pharmacies.count()}")
    
    for pharmacy in pharmacies[:2]:  # Test first 2 pharmacies
        print(f"\n🏥 Testing pharmacy: {pharmacy.name}")
        
        users = User.objects.filter(pharmacy=pharmacy)
        if users.exists():
            user = users.first()
            
            # Test supplier filtering
            factory = APIRequestFactory()
            request = factory.get('/api/purchases/suppliers/')
            request.user = user
            
            supplier_view = SupplierViewSet()
            supplier_view.request = request
            supplier_queryset = supplier_view.get_queryset()
            
            # Test purchase filtering
            purchase_view = PurchaseViewSet()
            purchase_view.request = request
            purchase_queryset = purchase_view.get_queryset()
            
            print(f"   👥 Suppliers visible: {supplier_queryset.count()}")
            print(f"   🛒 Purchases visible: {purchase_queryset.count()}")
            
            # Check for cross-pharmacy data leakage
            wrong_pharmacy_purchases = purchase_queryset.exclude(pharmacy=pharmacy)
            if wrong_pharmacy_purchases.exists():
                print(f"   ❌ SECURITY ISSUE: {wrong_pharmacy_purchases.count()} purchases from other pharmacies!")
            else:
                print("   ✅ Purchase data properly isolated")
    
    # 2. Test backend pagination and filtering
    print("\n2. 📄 Backend Pagination & Filtering Test")
    all_suppliers = Supplier.objects.all()
    all_purchases = Purchase.objects.all()
    
    print(f"📊 Total suppliers in system: {all_suppliers.count()}")
    print(f"📊 Total purchases in system: {all_purchases.count()}")
    
    if all_suppliers.exists():
        # Test supplier filtering
        supplier_view = SupplierViewSet()
        test_request = APIRequestFactory().get('/api/purchases/suppliers/', {
            'search': 'test',
            'sort_by': 'name',
            'sort_dir': 'asc',
            'page': 1,
            'page_size': 10
        })
        if User.objects.filter(pharmacy__isnull=False).exists():
            test_request.user = User.objects.filter(pharmacy__isnull=False).first()
            
            try:
                response = supplier_view.list(test_request)
                print(f"✅ Supplier backend filtering works: {response.status_code}")
                if hasattr(response, 'data'):
                    print(f"   Response keys: {list(response.data.keys())}")
            except Exception as e:
                print(f"❌ Supplier filtering error: {e}")
    
    # 3. Test model relationships
    print("\n3. 🔗 Model Relationships Test")
    
    # Test Supplier-Purchase relationship
    suppliers_with_purchases = Supplier.objects.filter(purchase__isnull=False).distinct()
    print(f"👥 Suppliers with purchases: {suppliers_with_purchases.count()}")
    
    # Test Purchase-Item relationship
    purchases_with_items = Purchase.objects.filter(items__isnull=False).distinct()
    print(f"🛒 Purchases with items: {purchases_with_items.count()}")
    
    # Test SupplierTransaction integrity
    transactions = SupplierTransaction.objects.all()
    print(f"💰 Supplier transactions: {transactions.count()}")
    
    # 4. Test permissions
    print("\n4. 🔐 Permissions Test")
    
    # Test with authenticated user
    auth_users = User.objects.filter(pharmacy__isnull=False)
    if auth_users.exists():
        print("✅ Users with pharmacy found")
        
        # Test with user without pharmacy
        users_no_pharmacy = User.objects.filter(pharmacy__isnull=True)
        if users_no_pharmacy.exists():
            user_no_pharmacy = users_no_pharmacy.first()
            
            purchase_view = PurchaseViewSet()
            test_request = APIRequestFactory().get('/api/purchases/purchases/')
            test_request.user = user_no_pharmacy
            purchase_view.request = test_request
            
            empty_queryset = purchase_view.get_queryset()
            if empty_queryset.count() == 0:
                print("✅ Users without pharmacy get empty queryset")
            else:
                print("❌ Users without pharmacy can see data - security issue!")
    
    # 5. Test credit management
    print("\n5. 💳 Supplier Credit Management Test")
    
    suppliers_with_balance = Supplier.objects.exclude(current_balance=0)
    print(f"💰 Suppliers with non-zero balance: {suppliers_with_balance.count()}")
    
    for supplier in suppliers_with_balance[:3]:
        print(f"   👥 {supplier.name}: Balance = {supplier.current_balance}")
        
        # Test balance calculation
        try:
            transactions = supplier.transactions.all()
            calculated_balance = 0
            for tx in transactions:
                if tx.type == 'purchase':
                    calculated_balance += tx.amount
                elif tx.type == 'payment':
                    calculated_balance -= tx.amount
                elif tx.type == 'reset':
                    calculated_balance = tx.amount
            
            if abs(calculated_balance - supplier.current_balance) < 0.01:
                print(f"   ✅ Balance calculation correct")
            else:
                print(f"   ❌ Balance mismatch: calculated={calculated_balance}, stored={supplier.current_balance}")
        except Exception as e:
            print(f"   ⚠️  Balance calculation error: {e}")
    
    print("\n🎉 Purchases & Suppliers Module Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_purchases_suppliers_readiness()
