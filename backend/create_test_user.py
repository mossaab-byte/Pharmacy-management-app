#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')

django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy

User = get_user_model()

def create_test_user():
    # Use the first existing pharmacy
    pharmacy = Pharmacy.objects.first()
    if not pharmacy:
        pharmacy = Pharmacy.objects.create(
            name="Test Pharmacy",
            address='123 Test Street',
            phone='+1234567890',
            email='test@pharmacy.com'
        )
    print(f"Using pharmacy: {pharmacy.name}")
    
    # Create test user
    username = "testuser"
    email = "test@example.com"
    password = "testpass123"
    
    # Delete existing user if exists
    if User.objects.filter(username=username).exists():
        User.objects.filter(username=username).delete()
        print(f"Deleted existing user: {username}")
    
    # Create new user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        pharmacy=pharmacy,
        is_pharmacist=True,
        can_manage_users=True,
        can_manage_inventory=True,
        can_manage_sales=True,
        can_manage_purchases=True,
        can_view_reports=True
    )
    
    print(f"Created user: {user.username}")
    print(f"Email: {user.email}")
    print(f"Password: {password}")
    print(f"Is pharmacist: {user.is_pharmacist}")
    print(f"Can manage users: {user.can_manage_users}")
    print(f"Pharmacy: {user.pharmacy.name}")
    
    return user

if __name__ == "__main__":
    create_test_user()
