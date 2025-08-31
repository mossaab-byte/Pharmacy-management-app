#!/usr/bin/env python3
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== CHECKING ALL SALES IN DATABASE ===")
all_sales = Sale.objects.all().order_by('-created_at')
print(f"TOTAL SALES: {all_sales.count()}")
print()

# Group by pharmacy
pharmacy_groups = {}
for sale in all_sales:
    pharmacy_name = sale.pharmacy.name if sale.pharmacy else "NO_PHARMACY"
    if pharmacy_name not in pharmacy_groups:
        pharmacy_groups[pharmacy_name] = []
    pharmacy_groups[pharmacy_name].append(sale)

print("SALES BY PHARMACY:")
for pharmacy, sales in pharmacy_groups.items():
    print(f"{pharmacy}: {len(sales)} sales")
    for sale in sales[:3]:  # Show first 3 sales
        customer_name = sale.customer.name if sale.customer else "Walk-in"
        print(f"  Sale {sale.id}: {customer_name} - {sale.total_amount} DH - {sale.created_at.date()}")
    print()

# Check galvus user
print("=== GALVUS USER INFO ===")
galvus = User.objects.filter(username='galvus').first()
if galvus:
    print(f"Username: {galvus.username}")
    print(f"Pharmacy: {galvus.pharmacy.name if galvus.pharmacy else 'NONE'}")
    if galvus.pharmacy:
        print(f"Pharmacy ID: {galvus.pharmacy.id}")
        
        # Check sales for galvus's pharmacy
        galvus_pharmacy_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).order_by('-created_at')
        print(f"Sales for galvus pharmacy ({galvus.pharmacy.name}): {galvus_pharmacy_sales.count()}")
else:
    print("GALVUS USER NOT FOUND!")

print()
print("=== CHECKING OTHER USERS ===")
all_users = User.objects.all()
for user in all_users:
    if user.pharmacy:
        print(f"User: {user.username} -> Pharmacy: {user.pharmacy.name}")
