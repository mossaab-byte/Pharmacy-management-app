#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Supplier, SupplierTransaction, Purchase
from django.db.models import Sum

def fix_supplier_balances():
    print("=== FIXING SUPPLIER BALANCES ===")
    
    suppliers = Supplier.objects.all()
    
    for supplier in suppliers:
        print(f"\nFixing supplier: {supplier.name}")
        
        # Get actual purchases (not deleted)
        actual_purchases = Purchase.objects.filter(supplier=supplier)
        
        actual_purchase_total = actual_purchases.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        print(f"  Current balance in DB: {supplier.current_balance}")
        print(f"  Actual purchases total: {actual_purchase_total}")
        
        # Get all transactions
        transactions = SupplierTransaction.objects.filter(supplier=supplier)
        transaction_total = transactions.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        print(f"  Transactions total: {transaction_total}")
        print(f"  Number of transactions: {transactions.count()}")
        print(f"  Number of actual purchases: {actual_purchases.count()}")
        
        if abs(actual_purchase_total - transaction_total) > 0.01:  # Allow for small floating point differences
            print(f"  ⚠️ MISMATCH DETECTED!")
            print(f"  Difference: {transaction_total - actual_purchase_total}")
            
            # Get purchase IDs that actually exist
            existing_purchase_ids = set(str(pid) for pid in actual_purchases.values_list('id', flat=True))
            
            print(f"  Existing purchase IDs: {len(existing_purchase_ids)}")
            
            # Show all transactions
            print("  All transactions:")
            for trans in transactions:
                print(f"    {trans.date} - {trans.type} - {trans.amount} DH (ref: {trans.reference})")
                
                # Check if this transaction references a purchase that no longer exists
                if trans.type == 'purchase' and trans.reference not in existing_purchase_ids:
                    print(f"    ❌ This transaction references non-existent purchase: {trans.reference}")
            
            # Option 1: Recalculate balance based on actual purchases only
            print(f"  Updating balance to match actual purchases: {actual_purchase_total} DH")
            supplier.current_balance = actual_purchase_total
            supplier.save()
            
            print(f"  ✅ Updated balance: {supplier.current_balance} DH")
        else:
            print(f"  ✅ Balance is correct")

if __name__ == "__main__":
    fix_supplier_balances()
