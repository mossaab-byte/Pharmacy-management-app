"""
Test API call with authentication to see what's being returned
"""
import requests
import json

# Test with a simple session to get auth token
session = requests.Session()

# First, try to get a token (you'll need to provide valid credentials)
login_data = {
    "username": "marouaneTibary",  # The user who owns the marmar pharmacy
    "password": "admin123"  # Replace with actual password
}

try:
    # Try to login using the correct endpoint
    response = session.post('http://localhost:8000/api/login/', json=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access')
        print(f"Got token: {token[:20]}...")
        
        # Now call the purchases API with authentication
        headers = {'Authorization': f'Bearer {token}'}
        
        response = session.get('http://localhost:8000/api/purchases/purchases/', headers=headers)
        print(f"Purchase API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if 'results' in data:
                purchases = data['results']
                print(f"Found {len(purchases)} purchases")
                
                for i, p in enumerate(purchases[:3]):
                    print(f"\nPurchase {i+1}:")
                    print(f"  ID: {p.get('id')}")
                    print(f"  total: {p.get('total')}")
                    print(f"  total_amount: {p.get('total_amount')}")
                    print(f"  supplier_name: {p.get('supplier_name')}")
                    print(f"  items_count: {p.get('items_count')}")
                    print(f"  status: {p.get('status')}")
            else:
                print("No 'results' key in response")
        else:
            print(f"Error: {response.text}")
    else:
        print(f"Login failed: {response.text}")
        
        # Try without authentication to see if it's an auth issue
        print("\nTrying without authentication...")
        response = session.get('http://localhost:8000/api/purchases/purchases/')
        print(f"No-auth status: {response.status_code}")
        print(f"No-auth response: {response.text[:200]}")

except Exception as e:
    print(f"Error: {e}")
