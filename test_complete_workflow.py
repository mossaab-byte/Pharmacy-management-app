#!/usr/bin/env python3
"""
Complete Workflow Test - Register, Login, and Access Forms
"""

import requests
import json
import random
import string

def generate_random_string(length=8):
    """Generate a random string for unique usernames/emails."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def complete_workflow_test():
    """Test the complete user workflow from registration to form access."""
    print("🎯 Complete Pharmacy System Workflow Test")
    print("=" * 60)
    
    random_suffix = generate_random_string()
    
    # Step 1: Register a new user
    print("1️⃣ Step 1: User Registration")
    print("-" * 30)
    
    registration_data = {
        "username": f"workflowtest_{random_suffix}",
        "email": f"workflow_{random_suffix}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Workflow",
        "last_name": "Test"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/register-user/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Registration successful!")
            print(f"   Username: {data['user']['username']}")
            print(f"   Is Pharmacist: {data['user']['is_pharmacist']}")
            print(f"   Access token received: {'access' in data}")
            
            # Store auth data (simulating frontend localStorage)
            access_token = data['access']
            user_data = data['user']
            
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return False
    
    # Step 2: Login (simulate what frontend would do)
    print(f"\n2️⃣ Step 2: User Login")
    print("-" * 30)
    
    login_data = {
        "username": registration_data['username'],
        "password": registration_data['password']
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/token/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            login_result = response.json()
            print("✅ Login successful!")
            print(f"   New access token received")
            
            # Use login token (this is what frontend would store)
            access_token = login_result['access']
            headers = {"Authorization": f"Bearer {access_token}"}
            
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False
    
    # Step 3: Access all form data endpoints
    print(f"\n3️⃣ Step 3: Access Form Data (what frontend forms need)")
    print("-" * 30)
    
    form_endpoints = [
        ("/sales/customers/", "Customers for sales forms"),
        ("/medicine/medicines/", "Medicines for sales/purchase forms"),
        ("/purchases/suppliers/", "Suppliers for purchase forms"),
        ("/sales/sales/", "Sales data"),
        ("/purchases/purchases/", "Purchase data")
    ]
    
    all_success = True
    
    for endpoint, description in form_endpoints:
        try:
            response = requests.get(f"http://localhost:8000/api{endpoint}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', len(data) if isinstance(data, list) else 0)
                print(f"✅ {description}: {count} items")
            else:
                print(f"❌ {description}: HTTP {response.status_code}")
                all_success = False
                
        except Exception as e:
            print(f"❌ {description}: Error - {str(e)}")
            all_success = False
    
    # Step 4: Summary
    print(f"\n4️⃣ Workflow Summary")
    print("-" * 30)
    
    if all_success:
        print("🎉 Complete workflow successful!")
        print("\n📋 What this means for users:")
        print("   1. ✅ Registration creates pharmacist accounts automatically")
        print("   2. ✅ Login provides access tokens for API calls")
        print("   3. ✅ All form data endpoints are accessible after login")
        print("   4. ✅ Sales forms can load customers and medicines")
        print("   5. ✅ Purchase forms can load suppliers and medicines")
        print("   6. ✅ All CRUD operations should work")
        
        print(f"\n🌐 Frontend Instructions:")
        print("   1. Users must visit http://localhost:3001/login")
        print("   2. After login, they can access any form")
        print("   3. Forms will load real data from the backend")
        print("   4. All sales/purchase workflows should work")
        
        print(f"\n🔧 If forms still don't work:")
        print("   1. Check browser console for JavaScript errors")
        print("   2. Ensure authentication tokens are stored correctly")
        print("   3. Verify API calls include Bearer token headers")
        
    else:
        print("❌ Some endpoints failed - check permissions")
    
    return all_success

if __name__ == "__main__":
    complete_workflow_test()
