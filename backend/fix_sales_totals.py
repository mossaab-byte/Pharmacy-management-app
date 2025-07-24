#!/usr/bin/env python
"""
Django script to fix sales totals calculation
"""
import os
import sys
import django

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem
from decimal import Decimal

def fix_sales_totals():
    """Fix all sales totals by recalculating subtotals and updating totals"""
    print("=== Fixing Sales Totals ===")
    
    # Get all sales
    sales = Sale.objects.all()
    print(f"\nFound {sales.count()} sales to check")
    
    updated_count = 0
    
    for sale in sales:
        print(f"\n--- Sale {sale.reference} (ID: {str(sale.id)[:8]}) ---")
        print(f"Current total_amount: {sale.total_amount} DH")
        
        # Get all items for this sale
        items = sale.items.all()
        print(f"Items count: {items.count()}")
        
        total_expected = Decimal('0.00')
        items_fixed = 0
        
        for item in items:
            print(f"\n  📦 Item: {item.pharmacy_medicine.medicine.nom}")
            print(f"     Quantity: {item.quantity}")
            print(f"     Unit price: {item.unit_price} DH")
            print(f"     Current subtotal: {item.subtotal} DH")
            
            # Recalculate subtotal
            expected_subtotal = item.quantity * item.unit_price
            print(f"     Expected subtotal: {expected_subtotal} DH")
            
            if item.subtotal != expected_subtotal:
                print(f"     ⚠️  Subtotal mismatch! Fixing...")
                item.subtotal = expected_subtotal
                item.save()
                items_fixed += 1
                print(f"     ✅ Fixed subtotal: {item.subtotal} DH")
            
            total_expected += expected_subtotal
        
        print(f"\nExpected sale total: {total_expected} DH")
        
        # Update sale totals
        old_total = sale.total_amount
        sale.update_totals()
        
        if old_total != sale.total_amount:
            print(f"✅ Updated sale total: {old_total} DH → {sale.total_amount} DH")
            updated_count += 1
        else:
            print(f"✓ Sale total was already correct: {sale.total_amount} DH")
        
        if items_fixed > 0:
            print(f"Fixed {items_fixed} item subtotals")
    
    print(f"\n=== Summary ===")
    print(f"Total sales checked: {sales.count()}")
    print(f"Sales updated: {updated_count}")
    print("✅ All sales totals have been fixed!")

if __name__ == "__main__":
    fix_sales_totals()
