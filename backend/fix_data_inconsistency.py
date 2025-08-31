#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== FIXING DATA INCONSISTENCY ===")

# Get galvus user
galvus = User.objects.filter(username='galvus').first()
if not galvus or not galvus.pharmacy:
    print("ERROR: galvus user or pharmacy not found!")
    exit()

print(f"Galvus pharmacy: {galvus.pharmacy.name}")

# SOLUTION 1: Reassign ALL sales to galvus pharmacy
# This assumes you want all sales to belong to your pharmacy
all_sales = Sale.objects.all()
updated_count = 0

print(f"Found {all_sales.count()} total sales")

for sale in all_sales:
    if sale.pharmacy != galvus.pharmacy:
        old_pharmacy = sale.pharmacy.name if sale.pharmacy else "None"
        sale.pharmacy = galvus.pharmacy
        sale.save()
        updated_count += 1
        print(f"  Updated Sale {sale.id}: {old_pharmacy} -> {galvus.pharmacy.name}")

print(f"\n✅ FIXED: Updated {updated_count} sales to belong to {galvus.pharmacy.name}")

# Also fix any customers that might have wrong associations
# Since customers are filtered by sales, this should automatically fix customer visibility

print("\n=== VERIFYING FIX ===")
remaining_other_sales = Sale.objects.exclude(pharmacy=galvus.pharmacy).count()
galvus_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).count()

print(f"Sales belonging to {galvus.pharmacy.name}: {galvus_sales}")
print(f"Sales belonging to other pharmacies: {remaining_other_sales}")

if remaining_other_sales == 0:
    print("🎉 SUCCESS! All sales now belong to your pharmacy.")
    print("The cross-pharmacy data issue should be resolved.")
else:
    print("⚠️ There are still some sales assigned to other pharmacies.")

print("\nPlease refresh your browser and check if the issue is resolved.")
