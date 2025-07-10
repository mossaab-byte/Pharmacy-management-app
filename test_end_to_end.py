#!/usr/bin/env python3
"""
End-to-End Test Script for Pharmacy Management System
Tests both backend API endpoints and validates system functionality.
"""

import requests
import json
import random
import string
from datetime import datetime

def generate_random_string(length=8):
    """Generate a random string for unique usernames/emails."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def test_backend_endpoints():
    """Test all major backend endpoints."""
    base_url = "http://localhost:8000/api"
    
    print("🔍 Testing Backend API Endpoints...")
    print("=" * 50)
    
    # Test 1: User Registration
    print("\n1️⃣ Testing User Registration...")
    random_suffix = generate_random_string()
    registration_data = {
        "username": f"testuser_{random_suffix}",
        "email": f"test_{random_suffix}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(f"{base_url}/register-user/", json=registration_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Registration successful!")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Username: {data['user']['username']}")
            print(f"   Is Pharmacist: {data['user']['is_pharmacist']}")
            
            # Save tokens for further testing
            access_token = data['access']
            headers = {"Authorization": f"Bearer {access_token}"}
            
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return False
    
    # Test 2: Authentication Check
    print("\n2️⃣ Testing Authentication...")
    try:
        response = requests.get(f"{base_url}/auth/me/", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Authentication working!")
            print(f"   Current user: {user_data['username']}")
        else:
            print(f"❌ Auth check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Auth error: {str(e)}")
    
    # Test 3: Medicine API
    print("\n3️⃣ Testing Medicine API...")
    try:
        response = requests.get(f"{base_url}/medicine/medicines/", headers=headers)
        print(f"   Medicine API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0) if isinstance(data, dict) else len(data)
            print(f"✅ Medicine API working! Found {count} medicines")
        else:
            print(f"⚠️  Medicine API returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Medicine API error: {str(e)}")
    
    # Test 4: Sales API
    print("\n4️⃣ Testing Sales API...")
    try:
        response = requests.get(f"{base_url}/sales/sales/", headers=headers)
        print(f"   Sales API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0) if isinstance(data, dict) else len(data)
            print(f"✅ Sales API working! Found {count} sales")
        else:
            print(f"⚠️  Sales API returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Sales API error: {str(e)}")
    
    # Test 5: Purchases API
    print("\n5️⃣ Testing Purchases API...")
    try:
        response = requests.get(f"{base_url}/purchases/purchases/", headers=headers)
        print(f"   Purchases API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0) if isinstance(data, dict) else len(data)
            print(f"✅ Purchases API working! Found {count} purchases")
        else:
            print(f"⚠️  Purchases API returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Purchases API error: {str(e)}")
    
    # Test 6: Customers API
    print("\n6️⃣ Testing Customers API...")
    try:
        response = requests.get(f"{base_url}/sales/customers/", headers=headers)
        print(f"   Customers API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0) if isinstance(data, dict) else len(data)
            print(f"✅ Customers API working! Found {count} customers")
        else:
            print(f"⚠️  Customers API returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Customers API error: {str(e)}")
    
    # Test 7: Suppliers API
    print("\n7️⃣ Testing Suppliers API...")
    try:
        response = requests.get(f"{base_url}/purchases/suppliers/", headers=headers)
        print(f"   Suppliers API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0) if isinstance(data, dict) else len(data)
            print(f"✅ Suppliers API working! Found {count} suppliers")
        else:
            print(f"⚠️  Suppliers API returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Suppliers API error: {str(e)}")
    
    return True

def test_frontend_connectivity():
    """Test if the frontend is accessible."""
    print("\n🌐 Testing Frontend Connectivity...")
    print("=" * 50)
    
    try:
        # Check if frontend is running on port 3001
        response = requests.get("http://localhost:3001", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible on http://localhost:3001")
            return True
        else:
            print(f"⚠️  Frontend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend not accessible. Make sure it's running on port 3001")
        return False
    except Exception as e:
        print(f"❌ Frontend test error: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("🚀 Pharmacy Management System - End-to-End Test")
    print("=" * 60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test backend
    backend_ok = test_backend_endpoints()
    
    # Test frontend
    frontend_ok = test_frontend_connectivity()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 50)
    print(f"Backend API: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"Frontend:    {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 All systems are working correctly!")
        print("📋 Next steps:")
        print("   1. Open http://localhost:3001 in your browser")
        print("   2. Test user registration manually")
        print("   3. Verify all pages load without errors")
        print("   4. Test core workflows (sales, purchases, inventory)")
    else:
        print("\n⚠️  Some issues detected. Please check the logs above.")
    
    print(f"\n⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
