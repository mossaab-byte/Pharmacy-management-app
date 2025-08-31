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
        actual_purchases = Purchase.objects.filter(
            supplier=supplier,
            # Add any additional filters if needed (e.g., not soft-deleted)
        )
        
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
        
        if actual_purchase_total != transaction_total:
            print(f"  ⚠️ MISMATCH DETECTED!")
            print(f"  Cleaning up transactions...")
            
            # Get purchase IDs that actually exist
            existing_purchase_ids = set(actual_purchases.values_list('id', flat=True))
            
            # Find transactions that don't match existing purchases
            orphaned_transactions = transactions.exclude(
                reference__in=[str(pid) for pid in existing_purchase_ids]
            ).exclude(
                transaction_type='payment'  # Keep payment transactions
            )
            
            print(f"  Found {orphaned_transactions.count()} orphaned transactions")
            
            for orphaned in orphaned_transactions:
                print(f"    Removing orphaned transaction: {orphaned.reference} - {orphaned.amount} DH")
                orphaned.delete()
            
            # Recalculate balance based on remaining transactions
            remaining_transactions = SupplierTransaction.objects.filter(supplier=supplier)
            new_balance = remaining_transactions.aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            # Update supplier balance
            supplier.current_balance = new_balance
            supplier.save()
            
            print(f"  ✅ Updated balance: {supplier.current_balance} DH")
        else:
            print(f"  ✅ Balance is correct")

if __name__ == "__main__":
    fix_supplier_balances()
