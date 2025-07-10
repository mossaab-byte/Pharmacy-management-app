#!/usr/bin/env python3
"""
Comprehensive test for inventory and medicine endpoints
"""
import requests
import json
import time

BASE_URL = 'http://localhost:8000/api'

def test_endpoint(endpoint, method='GET', data=None, headers=None):
    """Test an API endpoint"""
    try:
        start_time = time.time()
        url = f"{BASE_URL}{endpoint}"
        
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        print(f"🔍 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        print(f"   Response time: {response_time:.2f}ms")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, dict):
                    if 'results' in data:
                        print(f"   Results count: {len(data['results'])}")
                        print(f"   Total count: {data.get('count', 'N/A')}")
                    elif 'count' in data:
                        print(f"   Count: {data['count']}")
                    else:
                        print(f"   Keys: {list(data.keys())}")
                elif isinstance(data, list):
                    print(f"   List length: {len(data)}")
                print("   ✅ SUCCESS")
            except json.JSONDecodeError:
                print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   Error: {response.text[:200]}...")
            print("   ❌ FAILED")
        
        print()
        return response.status_code == 200
        
    except Exception as e:
        print(f"   Exception: {str(e)}")
        print("   ❌ FAILED")
        print()
        return False

def main():
    print("🏥 Testing Inventory and Medicine Endpoints")
    print("=" * 50)
    
    # Get authentication token
    print("🔑 Attempting authentication...")
    auth_response = requests.post(f"{BASE_URL}/token/", json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    print(f"Auth response status: {auth_response.status_code}")
    if auth_response.status_code != 200:
        print(f"Auth response: {auth_response.text}")
    
    if auth_response.status_code == 200:
        token = auth_response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Authentication successful")
    else:
        print("❌ Authentication failed")
        # Try without authentication
        headers = {}
        print("🔄 Continuing without authentication...")
    
    print("\n🧪 Testing Medicine Endpoints...")
    test_endpoint('/medicine/medicines/', headers=headers)
    test_endpoint('/medicine/medicines/quick_search/?q=paracetamol', headers=headers)
    test_endpoint('/medicine/medicines/search_by_code/?code=ABC123', headers=headers)
    
    print("\n🧪 Testing Pharmacy Medicine Endpoints...")
    test_endpoint('/pharmacy/pharmacy-medicines/', headers=headers)
    test_endpoint('/pharmacy/pharmacies/', headers=headers)
    
    print("\n🧪 Testing Inventory Endpoints...")
    test_endpoint('/inventory/logs/', headers=headers)
    
    print("\n🧪 Testing Advanced Inventory Features...")
    # Test with pagination
    test_endpoint('/medicine/medicines/?page=1&page_size=10', headers=headers)
    test_endpoint('/medicine/medicines/?page=2&page_size=5', headers=headers)
    
    # Test search with different queries
    search_terms = ['doliprane', 'aspirin', 'panadol', 'efferalgan']
    for term in search_terms:
        test_endpoint(f'/medicine/medicines/quick_search/?q={term}', headers=headers)

if __name__ == '__main__':
    main()
