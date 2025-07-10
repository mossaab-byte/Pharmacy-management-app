#!/usr/bin/env python3
"""
Simple direct endpoint test without using views
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

def main():
    print("🏥 Testing Pharmacy API Endpoints Directly")
    print("=" * 50)
    
    # Get authentication token
    auth_response = requests.post(f"{BASE_URL}/token/", json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if auth_response.status_code == 200:
        token = auth_response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Authentication successful")
    else:
        print("❌ Authentication failed")
        return
    
    # Test just the GET request
    print("\n🧪 Testing GET requests...")
    
    endpoints = [
        '/pharmacy/',
        '/pharmacy/pharmacies/',
        '/pharmacy/pharmacy-medicines/',
        '/medicine/',
        '/medicine/medicines/',
        '/inventory/',
        '/inventory/logs/',
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            print(f"GET {endpoint}: {response.status_code}")
            if response.status_code == 500:
                # Just show first line of error
                error_text = response.text.split('\n')[0] if response.text else 'No error message'
                print(f"  Error: {error_text[:100]}...")
        except Exception as e:
            print(f"GET {endpoint}: Exception - {str(e)}")

if __name__ == '__main__':
    main()
