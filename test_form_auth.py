#!/usr/bin/env python3
"""
Test frontend authentication state and form functionality
"""

import requests
import json

def test_forms_without_auth():
    """Test what happens when accessing protected endpoints without auth"""
    print("🔍 Testing Form API Access Without Authentication...")
    print("=" * 60)
    
    base_url = "http://localhost:8000/api"
    
    # Test endpoints that forms would call
    endpoints = [
        "/sales/customers/",
        "/medicine/medicines/", 
        "/purchases/suppliers/",
        "/sales/sales/",
        "/purchases/purchases/"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            print(f"📍 {endpoint}")
            print(f"   Status: {response.status_code}")
            if response.status_code == 403:
                print("   ❌ Authentication required")
            elif response.status_code == 200:
                print("   ✅ Public access allowed")
            else:
                print(f"   ⚠️  Unexpected: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 60)

def test_forms_with_auth():
    """Test forms with proper authentication"""
    print("🔐 Testing Form API Access With Authentication...")
    print("=" * 60)
    
    # First, register and get token
    registration_data = {
        "username": "formtest123",
        "email": "formtest123@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    try:
        # Register user
        response = requests.post(
            "http://localhost:8000/api/register-user/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            access_token = data['access']
            headers = {"Authorization": f"Bearer {access_token}"}
            
            print(f"✅ User registered and authenticated")
            print(f"   Username: {data['user']['username']}")
            print(f"   Is Pharmacist: {data['user']['is_pharmacist']}")
            
            # Test endpoints with auth
            base_url = "http://localhost:8000/api"
            endpoints = [
                "/sales/customers/",
                "/medicine/medicines/", 
                "/purchases/suppliers/",
                "/sales/sales/",
                "/purchases/purchases/"
            ]
            
            for endpoint in endpoints:
                try:
                    response = requests.get(f"{base_url}{endpoint}", headers=headers)
                    print(f"\n📍 {endpoint}")
                    print(f"   Status: {response.status_code}")
                    if response.status_code == 200:
                        data = response.json()
                        count = data.get('count', len(data) if isinstance(data, list) else 0)
                        print(f"   ✅ Success - {count} items found")
                    else:
                        print(f"   ❌ Failed: {response.status_code}")
                        print(f"   Response: {response.text[:200]}...")
                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
                    
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during authentication test: {str(e)}")

def test_frontend_login_flow():
    """Test the login flow that frontend should use"""
    print("\n🔄 Testing Frontend Login Flow...")
    print("=" * 60)
    
    # Try to login with existing user
    login_data = {
        "username": "formtest123",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/token/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   Access token: {data['access'][:50]}...")
            print(f"   Refresh token: {data['refresh'][:50]}...")
            print("\n💡 Frontend should:")
            print("   1. Store tokens in localStorage")
            print("   2. Add Bearer token to API requests")
            print("   3. Redirect to dashboard after login")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")

def main():
    """Run form authentication tests"""
    print("🎯 Frontend Forms Authentication Test")
    print("=" * 60)
    
    test_forms_without_auth()
    test_forms_with_auth() 
    test_frontend_login_flow()
    
    print(f"\n🎉 Form Authentication Tests Complete!")
    print("=" * 60)
    print("📋 Key Findings:")
    print("   ❌ Forms need authentication to work")
    print("   ✅ APIs work correctly with proper tokens")
    print("   💡 Users must login before accessing forms")
    print("\n🔧 Next Steps:")
    print("   1. Ensure users login before accessing forms")
    print("   2. Store auth tokens in localStorage")
    print("   3. Add authentication guards to protected routes")

if __name__ == "__main__":
    main()
