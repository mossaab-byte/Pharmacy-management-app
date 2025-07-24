#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem

print("Checking sales and items...")

sales = Sale.objects.all().order_by('-created_at')[:5]  # Get latest 5 sales
print(f"Found {sales.count()} recent sales")

for sale in sales:
    print(f"\nSale {sale.reference}:")
    print(f"  Created: {sale.created_at}")
    print(f"  Total Amount: {sale.total_amount}")
    
    items = SaleItem.objects.filter(sale=sale)
    print(f"  Items count: {items.count()}")
    
    for item in items:
        print(f"    - {item.pharmacy_medicine.medicine.nom}")
        print(f"      Qty: {item.quantity}, Price: {item.unit_price}, Subtotal: {item.subtotal}")
    
    if not items.exists():
        print("    🚨 NO ITEMS FOUND - This explains the 0.00 total!")
    
    # Calculate what total should be
    calculated_total = sum(item.subtotal for item in items)
    print(f"  Should be: {calculated_total}")
    
    if sale.total_amount != calculated_total:
        print(f"  🔧 Fixing: {sale.total_amount} → {calculated_total}")
        sale.total_amount = calculated_total
        sale.save()
        print("  ✅ Fixed!")

print("\nDone!")
