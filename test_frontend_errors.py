#!/usr/bin/env python3
"""
Complete Frontend Error Scanner and Fixer
"""

import requests
import json
import random
import string

def test_all_frontend_errors():
    """Test and identify all frontend issues"""
    print("🔍 COMPLETE FRONTEND ERROR SCAN")
    print("=" * 60)
    
    # Step 1: Test backend is running
    print("1️⃣ Backend Connectivity Check")
    print("-" * 40)
    
    try:
        response = requests.get("http://localhost:8000/api/", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend API accessible")
        else:
            print(f"   ❌ Backend API issues: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend not accessible: {str(e)}")
        return False
    
    # Step 2: Test frontend is accessible
    print(f"\n2️⃣ Frontend Accessibility Check")
    print("-" * 40)
    
    try:
        response = requests.get("http://localhost:3001", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend accessible")
        else:
            print(f"   ❌ Frontend issues: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend not accessible: {str(e)}")
        return False
    
    # Step 3: Test authentication flow
    print(f"\n3️⃣ Authentication Flow Test")
    print("-" * 40)
    
    # Create test user
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    registration_data = {
        "username": f"errortest_{random_suffix}",
        "email": f"errortest_{random_suffix}@example.com",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    try:
        # Register
        response = requests.post(
            "http://localhost:8000/api/register-user/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            token = response.json()['access']
            print("   ✅ User registration working")
        else:
            # Try login with existing user
            login_data = {
                "username": f"errortest_{random_suffix}",
                "password": "testpass123"
            }
            response = requests.post(
                "http://localhost:8000/api/token/",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                token = response.json()['access']
                print("   ✅ User login working")
            else:
                print("   ❌ Authentication failed")
                return False
                
    except Exception as e:
        print(f"   ❌ Authentication error: {str(e)}")
        return False
    
    # Step 4: Test all critical API endpoints
    print(f"\n4️⃣ Critical API Endpoints Test")
    print("-" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    critical_endpoints = [
        ("/medicine/medicines/", "Medicines API"),
        ("/medicine/medicines/search_all/", "Medicine Search All"),
        ("/sales/customers/", "Customers API"),
        ("/purchases/suppliers/", "Suppliers API"),
        ("/sales/sales/", "Sales API"),
        ("/purchases/purchases/", "Purchases API")
    ]
    
    all_endpoints_working = True
    
    for endpoint, name in critical_endpoints:
        try:
            response = requests.get(f"http://localhost:8000/api{endpoint}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', len(data) if isinstance(data, list) else 0)
                print(f"   ✅ {name}: {count} items")
            else:
                print(f"   ❌ {name}: HTTP {response.status_code}")
                all_endpoints_working = False
        except Exception as e:
            print(f"   ❌ {name}: Error - {str(e)}")
            all_endpoints_working = False
    
    # Step 5: Test specific problem endpoints from screenshots
    print(f"\n5️⃣ Problem Endpoint Analysis")
    print("-" * 40)
    
    # Test medicine search endpoint specifically
    try:
        response = requests.get("http://localhost:8000/api/medicine/medicines/search_all/", headers=headers)
        if response.status_code == 200:
            medicines = response.json()
            print(f"   ✅ Medicine search_all: {len(medicines)} medicines")
            
            # Test search functionality
            if medicines:
                sample = medicines[0]
                required_fields = ['id', 'nom', 'dci1', 'prix_public', 'stock', 'forme']
                missing_fields = [field for field in required_fields if field not in sample]
                
                if missing_fields:
                    print(f"   ⚠️  Missing fields in medicine data: {missing_fields}")
                else:
                    print(f"   ✅ All required medicine fields present")
                    
                # Test search patterns
                search_terms = ['amox', 'dol', 'paracetamol']
                for term in search_terms:
                    matches = [m for m in medicines if 
                              term.lower() in str(m.get('nom', '')).lower() or
                              term.lower() in str(m.get('dci1', '')).lower()]
                    if matches:
                        print(f"   ✅ Search '{term}': {len(matches)} matches")
                    else:
                        print(f"   ⚠️  Search '{term}': No matches")
        else:
            print(f"   ❌ Medicine search_all failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Medicine search error: {str(e)}")
    
    # Step 6: Summary and recommendations
    print(f"\n6️⃣ Error Analysis Summary")
    print("-" * 40)
    
    if all_endpoints_working:
        print("🎉 All backend APIs working correctly!")
        print("\n💡 Frontend issues likely caused by:")
        print("   1. Authentication tokens not stored properly")
        print("   2. API calls not using Bearer token headers")
        print("   3. Component state management issues")
        print("   4. Import/export mismatches in services")
        print("   5. Error handling not showing proper messages")
        
        print(f"\n🔧 Next steps:")
        print("   1. Check browser console for JavaScript errors")
        print("   2. Verify localStorage has access_token")
        print("   3. Check Network tab for failed API calls")
        print("   4. Ensure all forms are accessed after login")
        
    else:
        print("❌ Backend API issues detected")
        print("   Fix backend endpoints before testing frontend")
    
    return all_endpoints_working

if __name__ == "__main__":
    test_all_frontend_errors()
