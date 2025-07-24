#!/usr/bin/env python
"""
Fix all sales totals in the database
This script will recalculate all sale totals based on their items
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem
from decimal import Decimal

def fix_all_sales_totals():
    print("🔧 Starting sales total fix...")
    
    # Get all sales
    sales = Sale.objects.all()
    print(f"📊 Found {sales.count()} sales to check")
    
    fixed_count = 0
    
    for sale in sales:
        # Calculate what the total should be
        items = SaleItem.objects.filter(sale=sale)
        
        print(f"\n🔍 Checking Sale {sale.reference} (ID: {sale.id})")
        print(f"   Current total_amount: {sale.total_amount}")
        print(f"   Items count: {items.count()}")
        
        if items.exists():
            # First ensure all sale items have correct subtotals
            for item in items:
                expected_subtotal = item.quantity * item.unit_price
                if item.subtotal != expected_subtotal:
                    print(f"   📝 Fixing item subtotal: {item.subtotal} → {expected_subtotal}")
                    item.subtotal = expected_subtotal
                    item.save()
            
            # Calculate total from items
            calculated_total = sum(item.subtotal for item in items)
            print(f"   Calculated total: {calculated_total}")
            
            # Update sale if needed
            if sale.total_amount != calculated_total:
                print(f"   💾 Updating sale total: {sale.total_amount} → {calculated_total}")
                sale.total_amount = calculated_total
                sale.units_sold = sum(item.quantity for item in items)
                sale.save()
                fixed_count += 1
            else:
                print(f"   ✅ Sale total is already correct")
        else:
            print(f"   ⚠️  No items found for this sale")
    
    print(f"\n✅ Fix completed! Updated {fixed_count} sales")
    
    # Show summary
    print("\n📈 Sales Summary After Fix:")
    for sale in Sale.objects.all().order_by('-created_at'):
        items_count = sale.items.count()
        total_qty = sum(item.quantity for item in sale.items.all())
        print(f"   {sale.reference}: {sale.total_amount} DH ({items_count} items, {total_qty} total qty)")

if __name__ == "__main__":
    fix_all_sales_totals()
