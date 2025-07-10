#!/usr/bin/env python
import os
import django
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale
from Purchases.models import Purchase, Supplier
from Authentification.models import PharmacyUser
from rest_framework.test import APIClient
import json

def test_endpoints():
    print("=== FRONTEND ENDPOINTS DEBUG ===")
    
    # Create test client
    client = APIClient()
    admin = PharmacyUser.objects.get(username='admin')
    client.force_authenticate(user=admin)
    
    # Test sales endpoint
    print('\n1. Testing Sales Endpoint')
    try:
        response = client.get('/api/sales/sales/')
        print(f'Status: {response.status_code}')
        print(f'Data type: {type(response.data)}')
        if response.status_code == 200:
            if isinstance(response.data, dict) and 'results' in response.data:
                print(f'Paginated results count: {len(response.data["results"])}')
                if response.data["results"]:
                    print(f'First sale sample: {response.data["results"][0]}')
            elif isinstance(response.data, list):
                print(f'Direct list count: {len(response.data)}')
                if response.data:
                    print(f'First sale sample: {response.data[0]}')
            else:
                print(f'Unexpected data format: {response.data}')
        else:
            print(f'Error response: {response.data}')
        
        sales_count = Sale.objects.count()
        print(f'Sales in DB: {sales_count}')
    except Exception as e:
        print(f'Sales endpoint error: {e}')
    
    # Test suppliers endpoint
    print('\n2. Testing Suppliers Endpoint')
    try:
        response = client.get('/api/purchases/suppliers/')
        print(f'Status: {response.status_code}')
        print(f'Data type: {type(response.data)}')
        if response.status_code == 200:
            if isinstance(response.data, dict) and 'results' in response.data:
                print(f'Paginated results count: {len(response.data["results"])}')
                if response.data["results"]:
                    print(f'First supplier sample: {response.data["results"][0]}')
            elif isinstance(response.data, list):
                print(f'Direct list count: {len(response.data)}')
                if response.data:
                    print(f'First supplier sample: {response.data[0]}')
            else:
                print(f'Unexpected data format: {response.data}')
        else:
            print(f'Error response: {response.data}')
            
        suppliers_count = Supplier.objects.count()
        print(f'Suppliers in DB: {suppliers_count}')
    except Exception as e:
        print(f'Suppliers endpoint error: {e}')
    
    # Test purchases endpoint
    print('\n3. Testing Purchases Endpoint')
    try:
        response = client.get('/api/purchases/purchases/')
        print(f'Status: {response.status_code}')
        print(f'Data type: {type(response.data)}')
        if response.status_code == 200:
            if isinstance(response.data, dict) and 'results' in response.data:
                print(f'Paginated results count: {len(response.data["results"])}')
                if response.data["results"]:
                    print(f'First purchase sample: {response.data["results"][0]}')
            elif isinstance(response.data, list):
                print(f'Direct list count: {len(response.data)}')
                if response.data:
                    print(f'First purchase sample: {response.data[0]}')
            else:
                print(f'Unexpected data format: {response.data}')
        else:
            print(f'Error response: {response.data}')
            
        purchases_count = Purchase.objects.count()
        print(f'Purchases in DB: {purchases_count}')
    except Exception as e:
        print(f'Purchases endpoint error: {e}')
    
    # Test customers endpoint (fixed endpoint)
    print('\n4. Testing Customers Endpoint')
    try:
        response = client.get('/api/sales/customers/')
        print(f'Status: {response.status_code}')
        print(f'Data type: {type(response.data)}')
        if response.status_code == 200:
            if isinstance(response.data, dict) and 'results' in response.data:
                print(f'Paginated results count: {len(response.data["results"])}')
                if response.data["results"]:
                    print(f'First customer sample: {response.data["results"][0]}')
            elif isinstance(response.data, list):
                print(f'Direct list count: {len(response.data)}')
                if response.data:
                    print(f'First customer sample: {response.data[0]}')
            else:
                print(f'Unexpected data format: {response.data}')
        else:
            print(f'Error response: {response.data}')
    except Exception as e:
        print(f'Customers endpoint error: {e}')

if __name__ == '__main__':
    test_endpoints()
