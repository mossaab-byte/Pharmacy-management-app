#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from Pharmacy.models import Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== COMPREHENSIVE DATA AUDIT ===")
print()

# Check all pharmacies
print("1. ALL PHARMACIES:")
pharmacies = Pharmacy.objects.all()
for pharmacy in pharmacies:
    print(f"   {pharmacy.name} (ID: {pharmacy.id})")
print()

# Check all users and their pharmacy associations
print("2. ALL USERS AND THEIR PHARMACIES:")
users = User.objects.all()
for user in users:
    pharmacy_name = user.pharmacy.name if hasattr(user, 'pharmacy') and user.pharmacy else "NO PHARMACY"
    print(f"   {user.username} -> {pharmacy_name}")
print()

# Check sales data integrity
print("3. SALES DATA INTEGRITY:")
sales = Sale.objects.all().order_by('-created_at')
print(f"   Total sales: {sales.count()}")

sales_by_pharmacy = {}
for sale in sales:
    pharmacy_name = sale.pharmacy.name if sale.pharmacy else "NO_PHARMACY"
    if pharmacy_name not in sales_by_pharmacy:
        sales_by_pharmacy[pharmacy_name] = []
    sales_by_pharmacy[pharmacy_name].append(sale)

for pharmacy_name, pharmacy_sales in sales_by_pharmacy.items():
    print(f"   {pharmacy_name}: {len(pharmacy_sales)} sales")
    for sale in pharmacy_sales[:2]:  # Show first 2 sales
        customer_name = sale.customer.name if sale.customer else "No Customer"
        print(f"      Sale {sale.id}: {customer_name} - {sale.total_amount} DH ({sale.created_at.date()})")
print()

# Check customer data
print("4. CUSTOMER DATA:")
customers = Customer.objects.all()
print(f"   Total customers: {customers.count()}")

# Group customers by the pharmacies they've bought from
customer_pharmacy_map = {}
for customer in customers:
    customer_sales = Sale.objects.filter(customer=customer)
    pharmacies_bought_from = set()
    for sale in customer_sales:
        if sale.pharmacy:
            pharmacies_bought_from.add(sale.pharmacy.name)
    
    if not pharmacies_bought_from:
        pharmacies_bought_from.add("NO_SALES")
    
    for pharmacy_name in pharmacies_bought_from:
        if pharmacy_name not in customer_pharmacy_map:
            customer_pharmacy_map[pharmacy_name] = []
        customer_pharmacy_map[pharmacy_name].append(customer)

for pharmacy_name, pharmacy_customers in customer_pharmacy_map.items():
    print(f"   {pharmacy_name}: {len(pharmacy_customers)} customers")
    for customer in pharmacy_customers[:2]:  # Show first 2 customers
        print(f"      {customer.user.first_name} {customer.user.last_name} ({customer.phone})")
print()

# Specific check for galvus user
print("5. GALVUS USER SPECIFIC CHECK:")
galvus = User.objects.filter(username='galvus').first()
if galvus:
    print(f"   Username: {galvus.username}")
    if hasattr(galvus, 'pharmacy') and galvus.pharmacy:
        print(f"   Pharmacy: {galvus.pharmacy.name} (ID: {galvus.pharmacy.id})")
        
        # Check sales for galvus's pharmacy
        galvus_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).order_by('-created_at')
        print(f"   Sales in galvus pharmacy: {galvus_sales.count()}")
        
        for sale in galvus_sales[:3]:
            customer_name = sale.customer.name if sale.customer else "Walk-in"
            print(f"      Sale {sale.id}: {customer_name} - {sale.total_amount} DH")
    else:
        print("   NO PHARMACY ASSOCIATED!")
else:
    print("   GALVUS USER NOT FOUND!")
