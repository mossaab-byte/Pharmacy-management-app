#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('C:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Supplier, SupplierTransaction, Purchase
from Pharmacy.models import Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

def test_purchase_deletion():
    """Test purchase deletion and supplier balance cleanup"""
    
    print("🔍 Testing purchase deletion and balance cleanup...")
    
    # Find a supplier with transactions
    suppliers = Supplier.objects.all()
    for supplier in suppliers:
        print(f"\n📊 Supplier: {supplier.name}")
        print(f"    Current balance: {supplier.current_balance}")
        
        transactions = SupplierTransaction.objects.filter(supplier=supplier)
        print(f"    Total transactions: {transactions.count()}")
        
        for tx in transactions:
            print(f"      {tx.type}: {tx.amount} (ref: {tx.reference})")
        
        purchases = Purchase.objects.filter(supplier=supplier)
        print(f"    Total purchases: {purchases.count()}")
        
        if purchases.exists():
            # Test deleting the first purchase
            purchase_to_delete = purchases.first()
            print(f"\n🗑️ Deleting purchase {purchase_to_delete.id} (amount: {purchase_to_delete.total_amount})")
            
            # Check transactions before deletion
            transactions_before = SupplierTransaction.objects.filter(supplier=supplier).count()
            balance_before = supplier.current_balance
            
            print(f"    Before deletion - Transactions: {transactions_before}, Balance: {balance_before}")
            
            # Delete the purchase
            purchase_to_delete.delete()
            
            # Refresh supplier from database
            supplier.refresh_from_db()
            
            # Check transactions after deletion
            transactions_after = SupplierTransaction.objects.filter(supplier=supplier).count()
            balance_after = supplier.current_balance
            
            print(f"    After deletion - Transactions: {transactions_after}, Balance: {balance_after}")
            
            # Show remaining transactions
            remaining_transactions = SupplierTransaction.objects.filter(supplier=supplier)
            print(f"    Remaining transactions:")
            for tx in remaining_transactions:
                print(f"      {tx.type}: {tx.amount} (ref: {tx.reference})")
            
            break
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_purchase_deletion()
