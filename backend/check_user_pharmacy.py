#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Manager, Pharmacy

User = get_user_model()

# Check user
user = User.objects.filter(username='marouaneTibary').first()
print(f"User found: {user}")

if user:
    print(f"User pharmacy: {getattr(user, 'pharmacy', None)}")
    print(f"User owned_pharmacy: {getattr(user, 'owned_pharmacy', None)}")
    
    # Check Manager
    manager = Manager.objects.filter(user=user).first()
    print(f"Manager found: {manager}")
    
    if manager:
        print(f"Manager pharmacy: {manager.pharmacy}")
    else:
        print("No manager record found - creating one...")
        pharmacy = Pharmacy.objects.first()
        if pharmacy:
            manager = Manager.objects.create(user=user, pharmacy=pharmacy)
            print(f"Created manager with pharmacy: {manager.pharmacy}")
        else:
            print("No pharmacy found to assign")
            # Create a test pharmacy
            pharmacy = Pharmacy.objects.create(
                nom="Test Pharmacy",
                adresse="123 Test Street",
                telephone="123456789",
                email="test@pharmacy.com",
                pharmacist=user
            )
            manager = Manager.objects.create(user=user, pharmacy=pharmacy)
            print(f"Created pharmacy and manager: {manager.pharmacy}")
else:
    print("User not found!")
