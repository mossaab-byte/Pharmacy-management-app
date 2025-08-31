"""
Script to fix existing purchase totals in the database
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Purchase, PurchaseItem

def fix_purchase_totals():
    print("🔧 Fixing existing purchase totals...")
    
    purchases = Purchase.objects.all()
    print(f"Found {purchases.count()} purchases")
    
    for purchase in purchases:
        # Calculate total from items
        items = purchase.items.all()
        total = sum(item.subtotal for item in items)
        
        print(f"Purchase {purchase.id}:")
        print(f"  - Current total: {purchase.total_amount}")
        print(f"  - Calculated total: {total}")
        print(f"  - Items: {items.count()}")
        
        if items.count() > 0:
            # Update the total
            purchase.total_amount = total
            purchase.save()
            print(f"  ✅ Updated total to: {purchase.total_amount}")
        else:
            print(f"  ⚠️  No items found for this purchase")
        print()

if __name__ == "__main__":
    fix_purchase_totals()
