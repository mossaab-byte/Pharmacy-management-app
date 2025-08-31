#!/usr/bin/env python
import requests
import json

def test_pharmacy_apis():
    print("=== TESTING PHARMACY APIs ===")
    
    # Test login first
    login_data = {
        "username": "marouaneTibary",
        "password": "marouane123"  # Try this password instead
    }
    
    try:
        print("1. Testing login...")
        login_response = requests.post('http://localhost:8000/api/login/', 
                                     json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get('access')
            print(f"✅ Login successful")
            print(f"Token: {token[:20]}..." if token else "No token")
            
            if token:
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                # Test dashboard KPIs
                print("\n2. Testing dashboard KPIs...")
                kpi_response = requests.get('http://localhost:8000/api/dashboard/kpis/', 
                                          headers=headers)
                
                if kpi_response.status_code == 200:
                    kpi_data = kpi_response.json()
                    print(f"✅ Dashboard KPIs: {kpi_data}")
                    print(f"✅ totalPurchases: {kpi_data.get('totalPurchases')}")
                else:
                    print(f"❌ Dashboard KPIs failed: {kpi_response.status_code}")
                    print(f"Response: {kpi_response.text}")
                
                # Test suppliers
                print("\n3. Testing suppliers...")
                supplier_response = requests.get('http://localhost:8000/api/purchases/suppliers/', 
                                               headers=headers)
                
                if supplier_response.status_code == 200:
                    supplier_data = supplier_response.json()
                    print(f"✅ Suppliers: {len(supplier_data.get('results', []))} found")
                    if supplier_data.get('results'):
                        first_supplier = supplier_data['results'][0]
                        print(f"✅ First supplier: {first_supplier.get('name')}")
                        print(f"✅ Credit limit: {first_supplier.get('credit_limit')}")
                        print(f"✅ Current balance: {first_supplier.get('current_balance')}")
                else:
                    print(f"❌ Suppliers failed: {supplier_response.status_code}")
                    print(f"Response: {supplier_response.text}")
            
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"❌ API test failed: {e}")

if __name__ == "__main__":
    test_pharmacy_apis()
