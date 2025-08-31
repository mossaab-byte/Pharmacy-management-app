#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import json

def test_api_endpoints():
    print("=== API ENDPOINT TEST ===")
    
    # Get user and create token
    User = get_user_model()
    user = User.objects.filter(username='marouaneTibary').first()
    
    if not user:
        print("❌ User not found!")
        return
    
    print(f"✅ User found: {user.username}")
    print(f"✅ Pharmacy: {user.pharmacy.name if user.pharmacy else 'None'}")
    
    # Create test client
    client = Client()
    
    # Test login
    login_response = client.post('/api/auth/login/', {
        'username': 'marouaneTibary',
        'password': 'password123'  # Use the actual password
    }, content_type='application/json')
    
    print(f"Login response status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data.get('access')
        print(f"✅ Login successful, token obtained")
        
        # Test dashboard KPIs
        kpi_response = client.get('/api/dashboard/kpis/', 
                                  HTTP_AUTHORIZATION=f'Bearer {token}')
        print(f"KPIs response status: {kpi_response.status_code}")
        
        if kpi_response.status_code == 200:
            kpi_data = kpi_response.json()
            print(f"✅ KPIs data: {kpi_data}")
            print(f"✅ totalPurchases: {kpi_data.get('totalPurchases')}")
        else:
            print(f"❌ KPIs failed: {kpi_response.content}")
        
        # Test suppliers
        supplier_response = client.get('/api/purchases/suppliers/', 
                                       HTTP_AUTHORIZATION=f'Bearer {token}')
        print(f"Suppliers response status: {supplier_response.status_code}")
        
        if supplier_response.status_code == 200:
            supplier_data = supplier_response.json()
            print(f"✅ Suppliers data: {supplier_data}")
            if supplier_data.get('results'):
                first_supplier = supplier_data['results'][0]
                print(f"✅ First supplier: {first_supplier.get('name')}")
                print(f"✅ Credit limit: {first_supplier.get('credit_limit')}")
                print(f"✅ Current balance: {first_supplier.get('current_balance')}")
        else:
            print(f"❌ Suppliers failed: {supplier_response.content}")
            
    else:
        print(f"❌ Login failed: {login_response.content}")

if __name__ == "__main__":
    test_api_endpoints()
