#!/usr/bin/env python3
import requests
import json

# Test the purchases API endpoint with authentication
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
        print(f"Auth response keys: {list(auth_data.keys())}")
        
        # Get the access token for API calls
        access_token = auth_data.get('access')
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Now test the purchases API
        print("\n📋 Testing purchases API...")
        purchases_url = f"{base_url}/api/purchases/purchases/?page=1&page_size=5"
        purchases_response = requests.get(purchases_url, headers=headers)
        
        print(f"Purchases API status: {purchases_response.status_code}")
        
        if purchases_response.status_code == 200:
            print("✅ Purchases API call successful!")
            data = purchases_response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if 'results' in data:
                print(f"Number of results: {len(data['results'])}")
                print(f"Total: {data.get('total', 'N/A')}")
                
                if data['results']:
                    print("\n📦 First purchase details:")
                    first_purchase = data['results'][0]
                    print(json.dumps(first_purchase, indent=2, default=str))
                else:
                    print("📭 No purchases found")
            else:
                print("Response data:")
                print(json.dumps(data, indent=2, default=str))
        else:
            print(f"❌ Purchases API call failed with status {purchases_response.status_code}")
            print("Response text:")
            print(purchases_response.text[:1000])
            
    else:
        print(f"❌ Login failed with status {login_response.status_code}")
        print("Response text:")
        print(login_response.text[:500])
        
except requests.exceptions.ConnectionError:
    print("❌ Connection failed. Make sure the Django server is running on localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}")
