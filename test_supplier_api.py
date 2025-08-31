#!/usr/bin/env python3
import requests
import json

# Test the supplier API endpoint with authentication
base_url = "http://localhost:8000"

# Login credentials from the test pharmacist script
login_data = {
    "username": "testpharmacist",
    "password": "testpass123"
}

try:
    session = requests.Session()
    
    # First, login to get authentication
    print("🔐 Logging in...")
    login_response = session.post(f'{base_url}/api/login/', json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        print("✅ Login successful!")
        auth_data = login_response.json()
        
        # Get the access token for API calls
        access_token = auth_data.get('access')
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Now test the suppliers API
        print("\n🏢 Testing suppliers API...")
        suppliers_url = f"{base_url}/api/purchases/suppliers/"
        suppliers_response = requests.get(suppliers_url, headers=headers)
        
        print(f"Suppliers API status: {suppliers_response.status_code}")
        
        if suppliers_response.status_code == 200:
            print("✅ Suppliers API call successful!")
            data = suppliers_response.json()
            print(f"Response type: {type(data)}")
            
            suppliers = data if isinstance(data, list) else data.get('results', [])
            print(f"Number of suppliers: {len(suppliers)}")
            
            if suppliers:
                print("\n📋 First supplier details:")
                first_supplier = suppliers[0]
                print(json.dumps(first_supplier, indent=2, default=str))
                
                # Check specific fields
                print(f"\n💰 Financial Info:")
                print(f"   Credit Limit: {first_supplier.get('credit_limit', 'NOT FOUND')}")
                print(f"   Current Balance: {first_supplier.get('current_balance', 'NOT FOUND')}")
                print(f"   Payment Terms: {first_supplier.get('payment_terms', 'NOT FOUND')}")
            else:
                print("📭 No suppliers found")
        else:
            print(f"❌ Suppliers API call failed with status {suppliers_response.status_code}")
            print("Response text:")
            print(suppliers_response.text[:1000])
            
    else:
        print(f"❌ Login failed with status {login_response.status_code}")
        print("Response text:")
        print(login_response.text[:500])
        
except requests.exceptions.ConnectionError:
    print("❌ Connection failed. Make sure the Django server is running on localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}")
