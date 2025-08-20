#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/'.join(__file__.split('/')[:-1]))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from purchases.models import Supplier

# Delete all suppliers
print("Current suppliers in database:")
suppliers = Supplier.objects.all()
for supplier in suppliers:
    print(f"- {supplier.name} (ID: {supplier.id})")

if suppliers.exists():
    count = suppliers.count()
    suppliers.delete()
    print(f"\n✅ Deleted {count} mock suppliers from database")
else:
    print("\n✅ No suppliers found in database")

print("Database is now clean!")
