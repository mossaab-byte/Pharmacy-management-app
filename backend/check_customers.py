#!/usr/bin/env python
import os
import django
import sys

sys.path.insert(0, r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Customer, Sale, SaleItem
from django.contrib.auth.models import User

print('=== CURRENT CUSTOMERS IN DATABASE ===')
customers = Customer.objects.all()
for customer in customers:
    print(f'Customer ID: {customer.id}')
    if customer.user:
        print(f'  User: {customer.user.username}')
        print(f'  Name: {customer.user.first_name} {customer.user.last_name}')
        print(f'  Email: {customer.user.email}')
    else:
        print('  No user associated')
    print(f'  Phone: {customer.phone}')
    print(f'  Balance: {customer.balance}')
    
    # Check sales for this customer
    sales = Sale.objects.filter(customer=customer)
    print(f'  Sales count: {sales.count()}')
    for sale in sales:
        print(f'    - Sale {sale.reference}: {sale.total_amount} DH')
    print()

print(f'Total customers: {customers.count()}')

# Check if these are the mock customers by looking at their data
print('\n=== IDENTIFYING MOCK DATA ===')
mock_customers = []
for customer in customers:
    if customer.user and customer.user.email in ['customer1@email.com', 'customer2@email.com']:
        print(f'MOCK CUSTOMER FOUND: {customer.user.email}')
        mock_customers.append(customer)
    elif customer.phone in ['+1-555-0201', '+1-555-0202']:
        print(f'MOCK CUSTOMER FOUND: {customer.phone}')
        mock_customers.append(customer)

print(f'Found {len(mock_customers)} mock customers to remove')
