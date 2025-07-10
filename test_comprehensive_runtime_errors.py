#!/usr/bin/env python3
"""
Comprehensive Frontend Runtime Error Detection
This script tests actual browser-like scenarios to find real errors
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_authentication_workflow():
    """Test complete authentication workflow"""
    print("\n=== Testing Authentication Workflow ===")
    
    try:
        # 1. Register a new user
        timestamp = int(time.time())
        registration_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "testpass123",
            "password_confirm": "testpass123"
        }
        
        print("1. Testing registration...")
        reg_response = requests.post(
            f"{BASE_URL}/api/register-user/",
            json=registration_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if reg_response.status_code == 201:
            print("✅ Registration successful")
        else:
            print(f"❌ Registration failed: {reg_response.status_code}")
            print(reg_response.text)
            return False
        
        # 2. Login with the new user
        print("2. Testing login...")
        login_data = {
            "username": registration_data["username"],
            "password": registration_data["password"]
        }
        
        login_response = requests.post(
            f"{BASE_URL}/api/token/",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens.get('access')
            print("✅ Login successful")
            
            # 3. Test authenticated endpoints
            headers = {'Authorization': f'Bearer {access_token}'}
            
            # Test critical endpoints that frontend uses
            endpoints_to_test = [
                '/api/sales/customers/',
                '/api/purchases/suppliers/',
                '/api/sales/sales/',
                '/api/purchases/purchases/',
                '/api/medicine/medicines/search_all/'
            ]
            
            print("3. Testing authenticated endpoints...")
            for endpoint in endpoints_to_test:
                try:
                    response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        print(f"✅ {endpoint}: {response.status_code} - {type(data).__name__}")
                        
                        # Check data structure
                        if isinstance(data, dict) and 'results' in data:
                            print(f"   📄 Paginated: {len(data['results'])} items")
                        elif isinstance(data, list):
                            print(f"   📄 Array: {len(data)} items")
                    else:
                        print(f"❌ {endpoint}: {response.status_code}")
                        
                except Exception as e:
                    print(f"❌ {endpoint}: {e}")
            
            return True
            
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return False
            
    except Exception as e:
        print(f"❌ Authentication workflow failed: {e}")
        return False

def test_medicine_search_functionality():
    """Test the medicine search that was problematic"""
    print("\n=== Testing Medicine Search Functionality ===")
    
    try:
        # Test the search_all endpoint (used by frontend)
        print("1. Testing medicine search_all endpoint...")
        response = requests.get(f"{BASE_URL}/api/medicine/medicines/search_all/")
        
        if response.status_code == 200:
            medicines = response.json()
            if isinstance(medicines, list):
                print(f"✅ Medicine search_all returns {len(medicines)} medicines as array")
                
                if medicines:
                    # Check first medicine structure
                    first_medicine = medicines[0]
                    required_fields = ['nom', 'prix_public', 'stock']
                    
                    missing_fields = [field for field in required_fields if field not in first_medicine]
                    if missing_fields:
                        print(f"❌ Medicine missing required fields: {missing_fields}")
                        print(f"Available fields: {list(first_medicine.keys())}")
                        return False
                    else:
                        print("✅ Medicine objects have all required fields")
                        
                    # Show sample medicine
                    print(f"Sample medicine: {first_medicine.get('nom', 'N/A')}")
                    
                return True
            else:
                print(f"❌ Medicine search_all returns {type(medicines).__name__}, expected list")
                return False
        else:
            print(f"❌ Medicine search_all failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Medicine search test failed: {e}")
        return False

def test_frontend_critical_data_endpoints():
    """Test endpoints that frontend forms depend on"""
    print("\n=== Testing Frontend Critical Data Endpoints ===")
    
    # Create a test user and get token for authenticated requests
    try:
        timestamp = int(time.time())
        registration_data = {
            "username": f"testapi_{timestamp}",
            "email": f"testapi_{timestamp}@example.com",
            "password": "testpass123",
            "password_confirm": "testpass123"
        }
        
        # Register and login
        requests.post(f"{BASE_URL}/api/register-user/", json=registration_data)
        login_response = requests.post(f"{BASE_URL}/api/token/", json={
            "username": registration_data["username"],
            "password": registration_data["password"]
        })
        
        if login_response.status_code != 200:
            print("❌ Could not get authentication token for testing")
            return False
            
        access_token = login_response.json().get('access')
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Test critical endpoints
        critical_tests = [
            {
                'name': 'Customer Service Endpoint',
                'url': '/api/sales/customers/',
                'expected_type': 'paginated_or_array'
            },
            {
                'name': 'Supplier Service Endpoint', 
                'url': '/api/purchases/suppliers/',
                'expected_type': 'paginated_or_array'
            },
            {
                'name': 'Sales Endpoint',
                'url': '/api/sales/sales/',
                'expected_type': 'paginated_or_array'
            },
            {
                'name': 'Purchases Endpoint',
                'url': '/api/purchases/purchases/',
                'expected_type': 'paginated_or_array'
            }
        ]
        
        all_passed = True
        
        for test in critical_tests:
            try:
                response = requests.get(f"{BASE_URL}{test['url']}", headers=headers, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check data structure matches frontend expectations
                    if test['expected_type'] == 'paginated_or_array':
                        if isinstance(data, list):
                            print(f"✅ {test['name']}: Returns array with {len(data)} items")
                        elif isinstance(data, dict) and 'results' in data:
                            print(f"✅ {test['name']}: Returns paginated data with {len(data['results'])} items")
                        else:
                            print(f"❌ {test['name']}: Unexpected data structure - {type(data).__name__}")
                            all_passed = False
                else:
                    print(f"❌ {test['name']}: HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                print(f"❌ {test['name']}: {e}")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Critical endpoints test failed: {e}")
        return False

def test_backend_medicine_serializer():
    """Test if medicine serializer includes frontend-expected fields"""
    print("\n=== Testing Medicine Serializer Fields ===")
    
    try:
        # Get a single medicine to check its fields
        response = requests.get(f"{BASE_URL}/api/medicine/medicines/search_all/")
        
        if response.status_code == 200:
            medicines = response.json()
            if isinstance(medicines, list) and len(medicines) > 0:
                medicine = medicines[0]
                
                # Fields that frontend expects
                frontend_expected_fields = [
                    'nom',           # Medicine name
                    'prix_public',   # Public price
                    'stock',         # Stock quantity
                    'dci1',          # Active ingredient
                    'forme',         # Form (tablet, syrup, etc.)
                    'code',          # Medicine code/barcode
                ]
                
                available_fields = list(medicine.keys())
                missing_fields = [field for field in frontend_expected_fields if field not in available_fields]
                
                print(f"Available fields: {available_fields}")
                
                if missing_fields:
                    print(f"❌ Missing frontend-expected fields: {missing_fields}")
                    return False
                else:
                    print("✅ All frontend-expected fields are present")
                    return True
            else:
                print("❌ No medicines available for testing")
                return False
        else:
            print(f"❌ Could not fetch medicines: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Medicine serializer test failed: {e}")
        return False

def main():
    print("Starting Comprehensive Frontend Runtime Error Detection")
    print("=" * 60)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=5)
        print("✅ Backend server is accessible")
    except:
        print("❌ Backend server is not accessible")
        return
    
    # Run all tests
    auth_works = test_authentication_workflow()
    medicine_search_works = test_medicine_search_functionality()
    critical_endpoints_work = test_frontend_critical_data_endpoints()
    serializer_correct = test_backend_medicine_serializer()
    
    # Summary
    print("\n" + "=" * 60)
    print("COMPREHENSIVE RUNTIME ERROR DETECTION SUMMARY")
    print("=" * 60)
    
    tests = [
        ("Authentication Workflow", auth_works),
        ("Medicine Search", medicine_search_works),
        ("Critical Data Endpoints", critical_endpoints_work),
        ("Medicine Serializer", serializer_correct)
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    print(f"\nTests Passed: {passed}/{total}")
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    if passed == total:
        print("\n🎉 All tests passed! Frontend should be working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Issues need to be addressed.")
    
    print("\nDetection complete!")

if __name__ == "__main__":
    main()
