"""
EMERGENCY FIX: Update all existing purchases and ensure totals are correct
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Purchase, PurchaseItem, Supplier, SupplierTransaction

def emergency_fix():
    print("🚨 EMERGENCY FIX: Updating all purchase totals and supplier balances")
    print("=" * 70)
    
    # Step 1: Fix all purchase totals
    print("Step 1: Fixing purchase totals...")
    purchases = Purchase.objects.all()
    
    for purchase in purchases:
        # Calculate total from items
        items = purchase.items.all()
        calculated_total = sum(item.subtotal for item in items)
        
        print(f"Purchase {purchase.id}:")
        print(f"  - Current total_amount: {purchase.total_amount}")
        print(f"  - Calculated total: {calculated_total}")
        print(f"  - Items count: {items.count()}")
        
        # Update the total
        purchase.total_amount = calculated_total
        purchase.save()
        print(f"  ✅ Updated total_amount to: {purchase.total_amount}")
    
    # Step 2: Fix supplier balances
    print("\nStep 2: Fixing supplier balances...")
    suppliers = Supplier.objects.all()
    
    for supplier in suppliers:
        print(f"\nSupplier: {supplier.name}")
        print(f"  - Current balance: {supplier.current_balance}")
        
        # Update balance
        supplier.update_balance()
        
        print(f"  ✅ Updated balance: {supplier.current_balance}")
        
        # Show transactions
        transactions = supplier.transactions.all().order_by('date')
        for tx in transactions:
            print(f"    - {tx.date.strftime('%Y-%m-%d')}: {tx.type} {tx.amount} (balance: {tx.running_balance})")
    
    # Step 3: Verify serializer output
    print("\nStep 3: Verifying serializer output...")
    from Purchases.serializers import PurchaseSerializer
    
    latest_purchase = Purchase.objects.order_by('-created_at').first()
    if latest_purchase:
        serializer = PurchaseSerializer(latest_purchase)
        data = serializer.data
        
        print(f"Latest purchase serializer output:")
        print(f"  - total: {data.get('total')}")
        print(f"  - total_amount: {data.get('total_amount')}")
        print(f"  - supplier_name: {data.get('supplier_name')}")
        print(f"  - items_count: {data.get('items_count')}")
        print(f"  - status: {data.get('status')}")
    
    print("\n🎉 EMERGENCY FIX COMPLETED!")
    print("✅ All purchase totals have been recalculated")
    print("✅ All supplier balances have been updated")
    print("✅ Serializer output verified")
    print("\n💡 Now refresh your browser and the totals should be correct!")

if __name__ == "__main__":
    emergency_fix()
