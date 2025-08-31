#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== CLEANING UP INCORRECT DATA ===")

# Get galvus user
galvus = User.objects.filter(username='galvus').first()
if not galvus or not galvus.pharmacy:
    print("ERROR: galvus user or pharmacy not found!")
    exit()

print(f"✅ Galvus pharmacy: {galvus.pharmacy.name}")

# OPTION 1: Delete all customers and sales that don't belong to galvus
# This is aggressive but will ensure clean data

print("\n1. CURRENT STATE:")
all_sales = Sale.objects.all()
all_customers = Customer.objects.all()
print(f"   Total sales: {all_sales.count()}")
print(f"   Total customers: {all_customers.count()}")

# Show some of the incorrect data
print("\n2. INCORRECT SALES:")
for sale in all_sales[:5]:
    customer_name = sale.customer.name if sale.customer else "Walk-in"
    pharmacy_name = sale.pharmacy.name if sale.pharmacy else "No pharmacy"
    print(f"   Sale {sale.id}: {customer_name} in {pharmacy_name}")

print("\n3. INCORRECT CUSTOMERS:")
for customer in all_customers[:5]:
    print(f"   Customer: {customer.user.first_name} {customer.user.last_name} ({customer.user.email})")

print("\n4. CLEANING UP...")

# Delete all sales not belonging to galvus pharmacy
wrong_sales = Sale.objects.exclude(pharmacy=galvus.pharmacy)
deleted_sales = wrong_sales.count()
wrong_sales.delete()
print(f"   ✅ Deleted {deleted_sales} incorrect sales")

# Delete all customers who don't have any sales in galvus pharmacy
remaining_sales = Sale.objects.filter(pharmacy=galvus.pharmacy)
valid_customer_ids = set(remaining_sales.values_list('customer_id', flat=True))
invalid_customers = Customer.objects.exclude(id__in=valid_customer_ids)
deleted_customers = invalid_customers.count()

# Also delete the associated user accounts for these customers
user_ids_to_delete = list(invalid_customers.values_list('user_id', flat=True))
invalid_customers.delete()

# Delete the associated User objects
deleted_users = User.objects.filter(id__in=user_ids_to_delete, pharmacy__isnull=True).delete()
print(f"   ✅ Deleted {deleted_customers} incorrect customers and their user accounts")

print("\n5. FINAL STATE:")
final_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).count()
final_customers = Customer.objects.count()
print(f"   Remaining sales in {galvus.pharmacy.name}: {final_sales}")
print(f"   Remaining customers: {final_customers}")

print("\n🎉 CLEANUP COMPLETE!")
print("All incorrect sales and customers have been removed.")
print("Only data belonging to your pharmacy should remain.")
print("\nPlease refresh your browser to see the changes.")
