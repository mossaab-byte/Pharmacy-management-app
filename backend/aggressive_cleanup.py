#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer, SaleItem
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== AGGRESSIVE FIX FOR DATA INCONSISTENCY ===")

# Get galvus user
galvus = User.objects.filter(username='galvus').first()
if not galvus or not galvus.pharmacy:
    print("ERROR: galvus user or pharmacy not found!")
    exit()

print(f"Galvus user: {galvus.username}")
print(f"Galvus pharmacy: {galvus.pharmacy.name}")
print()

# STEP 1: Delete all sales that don't belong to galvus pharmacy
print("STEP 1: Removing sales from other pharmacies...")
other_pharmacy_sales = Sale.objects.exclude(pharmacy=galvus.pharmacy)
other_count = other_pharmacy_sales.count()

if other_count > 0:
    print(f"Found {other_count} sales from other pharmacies:")
    for sale in other_pharmacy_sales[:5]:
        customer_name = sale.customer.name if sale.customer else "Walk-in"
        pharmacy_name = sale.pharmacy.name if sale.pharmacy else "No pharmacy"
        print(f"  - Sale {sale.id}: {customer_name} from {pharmacy_name}")
    
    # Delete these sales (this will also delete related SaleItems)
    deleted_count = other_pharmacy_sales.delete()[0]
    print(f"✅ DELETED {deleted_count} sales from other pharmacies")
else:
    print("No sales from other pharmacies found")

print()

# STEP 2: Delete customers who have no sales in galvus pharmacy
print("STEP 2: Removing orphaned customers...")
all_customers = Customer.objects.all()
customers_to_delete = []

for customer in all_customers:
    # Check if this customer has any sales in galvus pharmacy
    customer_sales_in_galvus = Sale.objects.filter(
        customer=customer, 
        pharmacy=galvus.pharmacy
    ).exists()
    
    if not customer_sales_in_galvus:
        customers_to_delete.append(customer)

if customers_to_delete:
    print(f"Found {len(customers_to_delete)} customers with no sales in galvus pharmacy:")
    for customer in customers_to_delete[:5]:
        print(f"  - {customer.user.first_name} {customer.user.last_name} ({customer.user.email})")
    
    # Delete these customers and their user accounts
    for customer in customers_to_delete:
        user = customer.user
        customer.delete()
        if user:
            user.delete()
    
    print(f"✅ DELETED {len(customers_to_delete)} orphaned customers and their user accounts")
else:
    print("No orphaned customers found")

print()

# STEP 3: Verify the cleanup
print("STEP 3: Verifying cleanup...")
remaining_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).count()
remaining_customers = Customer.objects.count()

print(f"Remaining sales in {galvus.pharmacy.name}: {remaining_sales}")
print(f"Remaining customers: {remaining_customers}")

# Show remaining customers
if remaining_customers > 0:
    print("Remaining customers:")
    for customer in Customer.objects.all():
        print(f"  - {customer.user.first_name} {customer.user.last_name} ({customer.user.email})")

print()
print("🎉 CLEANUP COMPLETE!")
print("Now refresh your browser and check if only your pharmacy's data is visible.")
