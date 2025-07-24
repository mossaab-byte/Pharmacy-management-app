#!/usr/bin/env python
"""
Create Django Superuser Script
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """Create a superuser if one doesn't exist"""
    
    username = 'admin'
    email = 'admin@pharmacy.com'
    password = 'pharmacy123'  # Simple password for testing
    
    print("🔐 CREATING DJANGO SUPERUSER")
    print("=" * 30)
    
    # Check if superuser already exists
    if User.objects.filter(username=username).exists():
        print(f"✅ Superuser '{username}' already exists!")
        user = User.objects.get(username=username)
        print(f"📧 Email: {user.email}")
        print(f"👤 Is superuser: {user.is_superuser}")
        print(f"🔑 Is staff: {user.is_staff}")
    else:
        # Create superuser
        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"✅ Superuser '{username}' created successfully!")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
        except Exception as e:
            print(f"❌ Error creating superuser: {str(e)}")
            return
    
    print(f"\n🌐 ACCESS DJANGO ADMIN:")
    print(f"🔗 URL: http://localhost:8000/admin/")
    print(f"👤 Username: {username}")
    print(f"🔑 Password: {password}")
    
    print(f"\n📋 TO DELETE PROBLEMATIC SALES:")
    print(f"1. Go to http://localhost:8000/admin/")
    print(f"2. Login with above credentials")
    print(f"3. Click on 'Sales' under 'SALES' section")
    print(f"4. Select problematic sales and delete them")
    print(f"5. Or click 'Select all' and 'Delete selected sales' to clear all")

if __name__ == '__main__':
    create_superuser()
