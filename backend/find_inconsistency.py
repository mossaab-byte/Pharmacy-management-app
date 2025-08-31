#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== FINDING DATA INCONSISTENCY ===")

# Get galvus user
galvus = User.objects.filter(username='galvus').first()
if not galvus:
    print("ERROR: galvus user not found!")
    exit()

if not galvus.pharmacy:
    print("ERROR: galvus user has no pharmacy!")
    exit()

print(f"Galvus user pharmacy: {galvus.pharmacy.name}")

# Check all sales
all_sales = Sale.objects.all().order_by('-created_at')
print(f"Total sales in database: {all_sales.count()}")

# Group sales by pharmacy
pharmacy_sales = {}
for sale in all_sales:
    pharmacy_name = sale.pharmacy.name if sale.pharmacy else "NO_PHARMACY"
    if pharmacy_name not in pharmacy_sales:
        pharmacy_sales[pharmacy_name] = []
    pharmacy_sales[pharmacy_name].append(sale)

print("\nSales by pharmacy:")
for pharmacy_name, sales in pharmacy_sales.items():
    print(f"  {pharmacy_name}: {len(sales)} sales")

# Find sales that DON'T belong to galvus pharmacy
other_pharmacy_sales = []
for sale in all_sales:
    if sale.pharmacy and sale.pharmacy != galvus.pharmacy:
        other_pharmacy_sales.append(sale)

print(f"\nSales from OTHER pharmacies (not galvus): {len(other_pharmacy_sales)}")
for sale in other_pharmacy_sales[:5]:
    customer_name = sale.customer.name if sale.customer else "Walk-in"
    print(f"  Sale {sale.id}: {sale.pharmacy.name} - {customer_name} - {sale.total_amount} DH - {sale.created_at.date()}")

# Check if this is the issue - maybe sales were created with wrong pharmacy
if len(other_pharmacy_sales) > 0:
    print(f"\n🚨 FOUND THE PROBLEM! There are {len(other_pharmacy_sales)} sales assigned to other pharmacies!")
    print("This is why you're seeing other pharmacy's sales.")
    
    # Option to fix: reassign all sales to galvus pharmacy
    print("\nDo you want to reassign ALL sales to galvus pharmacy? (This will fix the issue)")
    print("All sales will be moved to galvus pharmacy:", galvus.pharmacy.name)
else:
    print("\n✅ No sales from other pharmacies found. The issue might be elsewhere.")
