#!/usr/bin/env python
"""
Clean mock customer data and optimize customer management
"""
import os
import django
import sys

sys.path.insert(0, r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Customer, Sale, SaleItem
from django.contrib.auth.models import User
from django.db import transaction

def clean_mock_customers():
    print("🧹 Cleaning mock customer data...")
    
    # Identify mock customers by email patterns and phone patterns
    mock_emails = ['customer1@email.com', 'customer2@email.com']
    mock_phones = ['+1-555-0201', '+1-555-0202']
    
    mock_customers = Customer.objects.filter(
        user__email__in=mock_emails
    ) | Customer.objects.filter(
        phone__in=mock_phones
    )
    
    print(f"Found {mock_customers.count()} mock customers")
    
    with transaction.atomic():
        for customer in mock_customers:
            print(f"Removing customer: {customer.user.email if customer.user else customer.phone}")
            
            # Check if customer has any sales
            sales = Sale.objects.filter(customer=customer)
            if sales.exists():
                print(f"  - Customer has {sales.count()} sales, converting to walk-in customers")
                # Convert sales to walk-in customers instead of deleting
                sales.update(customer=None)
            
            # Delete the customer and associated user
            if customer.user:
                customer.user.delete()  # This will cascade delete the customer
            else:
                customer.delete()
    
    print("✅ Mock customers cleaned")

if __name__ == "__main__":
    clean_mock_customers()
