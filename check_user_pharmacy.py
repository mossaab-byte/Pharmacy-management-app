#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy
from Purchases.models import Supplier, SupplierTransaction

def check_user_pharmacy_link():
    print("🔍 CHECKING USER-PHARMACY LINKING")
    print("=" * 40)
    
    User = get_user_model()
    user = User.objects.filter(is_superuser=True).first()
    
    if not user:
        print("❌ No superuser found")
        return
        
    print(f"👤 User: {user.username}")
    print(f"📋 Has pharmacy attr: {hasattr(user, 'pharmacy')}")
    
    if hasattr(user, 'pharmacy'):
        print(f"🏥 User pharmacy: {getattr(user, 'pharmacy', None)}")
    
    # Check all pharmacies
    pharmacies = Pharmacy.objects.all()
    print(f"\n🏥 Total pharmacies in database: {pharmacies.count()}")
    
    for pharmacy in pharmacies:
        print(f"  - {pharmacy.name} (ID: {pharmacy.id})")
    
    # Check suppliers 
    suppliers = Supplier.objects.all()
    print(f"\n🏢 Total suppliers: {suppliers.count()}")
    
    for supplier in suppliers:
        print(f"  - {supplier.name} (ID: {supplier.id})")
    
    # Check transactions
    transactions = SupplierTransaction.objects.all()
    print(f"\n💰 Total transactions: {transactions.count()}")
    
    for trans in transactions[:5]:
        print(f"  - {trans.date} | {trans.type} | {trans.amount} DH | Supplier: {trans.supplier.name}")
        print(f"    Pharmacy: {trans.pharmacy.name if trans.pharmacy else 'None'}")

if __name__ == '__main__':
    check_user_pharmacy_link()
