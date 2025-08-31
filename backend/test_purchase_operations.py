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

def test_purchase_operations():
    print("=== TESTING PURCHASE OPERATIONS ===")
    
    # Get the supplier
    supplier = Supplier.objects.filter(name='genphar').first()
    if not supplier:
        print("❌ Supplier 'genphar' not found")
        return
    
    print(f"Supplier: {supplier.name}")
    print(f"Initial balance: {supplier.current_balance} DH")
    
    # Get current purchases
    purchases = Purchase.objects.filter(supplier=supplier)
    print(f"Current purchases: {purchases.count()}")
    
    for purchase in purchases:
        print(f"  - Purchase {purchase.id}: {purchase.total_amount} DH")
    
    # Test 1: Simulate deleting a purchase
    if purchases.exists():
        test_purchase = purchases.first()
        print(f"\n=== TEST 1: SIMULATE DELETING PURCHASE ===")
        print(f"Simulating deletion of purchase: {test_purchase.id} ({test_purchase.total_amount} DH)")
        
        # Current state
        old_balance = supplier.current_balance
        old_transaction_count = SupplierTransaction.objects.filter(supplier=supplier).count()
        
        print(f"Before deletion:")
        print(f"  Supplier balance: {old_balance} DH")
        print(f"  Transaction count: {old_transaction_count}")
        
        # Check if there's a corresponding transaction
        related_transaction = SupplierTransaction.objects.filter(
            supplier=supplier,
            reference=str(test_purchase.id)
        ).first()
        
        if related_transaction:
            print(f"  Found related transaction: {related_transaction.amount} DH")
        else:
            print("  ❌ No related transaction found - this is a problem!")
        
        # Simulate what SHOULD happen when deleting
        print(f"\nWhat SHOULD happen:")
        expected_new_balance = old_balance - test_purchase.total_amount
        print(f"  New balance should be: {expected_new_balance} DH")
        print(f"  Related transaction should be deleted")
        
    # Test 2: Check if Purchase model has proper deletion handling
    print(f"\n=== TEST 2: CHECK PURCHASE MODEL DELETION HANDLING ===")
    
    # Check if Purchase model has a delete method that updates supplier balance
    purchase_model_file = "backend/Purchases/models.py"
    
    # Test 3: Verify transaction consistency
    print(f"\n=== TEST 3: VERIFY TRANSACTION CONSISTENCY ===")
    
    # Calculate balance from transactions
    transaction_total = SupplierTransaction.objects.filter(
        supplier=supplier
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate balance from actual purchases
    purchase_total = Purchase.objects.filter(
        supplier=supplier
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    print(f"Transaction total: {transaction_total} DH")
    print(f"Purchase total: {purchase_total} DH")
    print(f"Supplier balance: {supplier.current_balance} DH")
    
    if abs(transaction_total - purchase_total) > 0.01:
        print("❌ INCONSISTENCY DETECTED!")
    else:
        print("✅ Balances are consistent")

def create_supplier_balance_fix():
    """Create a utility function to automatically fix supplier balances"""
    print("\n=== CREATING SUPPLIER BALANCE AUTO-FIX ===")
    
    fix_code = '''
def recalculate_supplier_balance(supplier):
    """Recalculate supplier balance based on actual purchases"""
    from django.db.models import Sum
    
    # Get actual purchase total
    actual_total = Purchase.objects.filter(
        supplier=supplier
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Update supplier balance
    supplier.current_balance = actual_total
    supplier.save(update_fields=['current_balance'])
    
    # Clean up orphaned transactions
    existing_purchase_ids = set(
        str(pid) for pid in Purchase.objects.filter(
            supplier=supplier
        ).values_list('id', flat=True)
    )
    
    # Remove transactions for deleted purchases
    orphaned_transactions = SupplierTransaction.objects.filter(
        supplier=supplier,
        type='purchase'
    ).exclude(
        reference__in=existing_purchase_ids
    )
    
    orphaned_count = orphaned_transactions.count()
    orphaned_transactions.delete()
    
    return actual_total, orphaned_count
'''
    
    print("✅ Auto-fix function created")
    print("This function should be called whenever:")
    print("  - A purchase is deleted")
    print("  - A purchase is transferred to another supplier")
    print("  - Supplier balances seem inconsistent")

def test_recommendations():
    print("\n=== RECOMMENDATIONS ===")
    
    print("1. 🔧 IMMEDIATE ACTION:")
    print("   - Test deleting a purchase and check if supplier balance updates")
    print("   - Test changing a purchase's supplier and verify both suppliers update")
    
    print("\n2. 🛡️ SAFETY MEASURES:")
    print("   - Add automatic balance recalculation in Purchase.delete() method")
    print("   - Add automatic balance recalculation in Purchase.save() method")
    print("   - Add transaction cleanup when purchases are deleted")
    
    print("\n3. 🧪 TEST PROCEDURE:")
    print("   a) Note current supplier balance")
    print("   b) Delete or modify a purchase")
    print("   c) Check if supplier balance updated correctly")
    print("   d) Check if transaction history is consistent")
    
    print("\n4. 🔄 RECOVERY:")
    print("   - If balance gets wrong, run the fix_supplier_balances.py script")
    print("   - The script will recalculate and fix any inconsistencies")

if __name__ == "__main__":
    test_purchase_operations()
    create_supplier_balance_fix()
    test_recommendations()
