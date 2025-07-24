#!/usr/bin/env python
"""
Script to fix sales data issues:
1. Fix unit prices that are 0 when subtotal is not 0
2. Recalculate all sale totals
3. Show customer data properly
"""
import os
import sys
import django

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem, Customer
from decimal import Decimal

def fix_sales_data():
    print("=== FIXING SALES DATA ISSUES ===\n")
    
    # Issue 1: Fix unit prices that are 0 when subtotal is not 0
    print("1. Fixing unit prices...")
    problematic_items = SaleItem.objects.filter(unit_price=0).exclude(subtotal=0)
    print(f"Found {problematic_items.count()} items with unit_price=0 but subtotal!=0")
    
    fixed_items = 0
    for item in problematic_items:
        print(f"\nFixing item: {item.pharmacy_medicine.medicine.nom}")
        print(f"  Current: qty={item.quantity}, unit_price={item.unit_price}, subtotal={item.subtotal}")
        
        if item.quantity > 0:
            correct_unit_price = item.subtotal / item.quantity
            item.unit_price = correct_unit_price
            item.save()
            print(f"  Fixed: unit_price={correct_unit_price}")
            fixed_items += 1
    
    print(f"✅ Fixed {fixed_items} items with incorrect unit prices\n")
    
    # Issue 2: Recalculate all sale totals
    print("2. Recalculating sale totals...")
    sales = Sale.objects.all()
    updated_sales = 0
    
    for sale in sales:
        old_total = sale.total_amount
        sale.update_totals()
        if old_total != sale.total_amount:
            print(f"Sale {str(sale.id)[:8]}: {old_total} → {sale.total_amount}")
            updated_sales += 1
    
    print(f"✅ Updated {updated_sales} sale totals\n")
    
    # Issue 3: Show customer information
    print("3. Customer information:")
    customers = Customer.objects.all()
    print(f"Total customers in database: {customers.count()}")
    
    for customer in customers:
        user = customer.user
        print(f"  - {user.first_name} {user.last_name}")
        print(f"    Phone: {customer.phone}")
        print(f"    Email: {user.email}")
        print(f"    Username: {user.username}")
        
        # Count sales for this customer
        sales_count = Sale.objects.filter(customer=customer).count()
        print(f"    Sales: {sales_count}")
        print()
    
    # Issue 4: Show sales without customers
    sales_without_customer = Sale.objects.filter(customer__isnull=True)
    print(f"Sales without customer assigned: {sales_without_customer.count()}")
    
    print("\n=== SUMMARY ===")
    print(f"✅ Fixed {fixed_items} items with incorrect unit prices")
    print(f"✅ Updated {updated_sales} sale totals")
    print(f"✅ Found {customers.count()} customers in database")
    print(f"⚠️  {sales_without_customer.count()} sales have no customer assigned")
    
    print("\n=== CURRENT SALES STATUS ===")
    for sale in Sale.objects.all():
        items = sale.items.all()
        customer_name = sale.customer.user.get_full_name() if sale.customer else "Walk-in Customer"
        print(f"Sale {str(sale.id)[:8]}: {customer_name} - {sale.total_amount} DH ({items.count()} items)")

if __name__ == "__main__":
    fix_sales_data()
