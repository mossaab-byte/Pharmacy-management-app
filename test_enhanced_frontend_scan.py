#!/usr/bin/env python3
"""
Updated Frontend Error Scanner with correct endpoints
"""
import requests
import json
import time
import subprocess
import os
import sys

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def check_api_endpoints():
    """Test all backend API endpoints with correct URLs"""
    print("\n=== Testing Backend API Endpoints (Corrected) ===")
    
    endpoints = [
        "/api/register-user/",  # Correct registration endpoint
        "/api/token/",  # Correct login endpoint
        "/api/sales/sales/",
        "/api/purchases/purchases/",
        "/api/medicine/medicines/",
        "/api/medicine/medicines/search_all/",
        "/api/sales/customers/",  # Correct customer endpoint
        "/api/purchases/suppliers/",  # Correct supplier endpoint
        "/api/inventory/",
        "/api/finance/",
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            results[endpoint] = {
                'status': response.status_code,
                'accessible': response.status_code in [200, 401, 403]  # 401/403 = auth required but endpoint exists
            }
            print(f"✓ {endpoint}: {response.status_code}")
        except Exception as e:
            results[endpoint] = {
                'status': 'error',
                'error': str(e),
                'accessible': False
            }
            print(f"✗ {endpoint}: {e}")
    
    return results

def test_frontend_service_imports():
    """Test if all services can be imported properly"""
    print("\n=== Testing Frontend Service Imports ===")
    
    # Create a test script to check imports
    test_script = """
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'frontend', 'src'))

try:
    # Test if we can load the service files without syntax errors
    with open('frontend/src/services/apiClient.js', 'r') as f:
        content = f.read()
        if 'export default' in content:
            print("✓ apiClient.js has default export")
        else:
            print("✗ apiClient.js missing default export")
    
    with open('frontend/src/services/medicineService.js', 'r') as f:
        content = f.read()
        if 'export default' in content:
            print("✓ medicineService.js has default export")
        else:
            print("✗ medicineService.js missing default export")
            
    with open('frontend/src/services/salesServices.js', 'r') as f:
        content = f.read()
        if 'export default' in content:
            print("✓ salesServices.js has default export")
        else:
            print("✗ salesServices.js missing default export")
            
    with open('frontend/src/services/customerService.js', 'r') as f:
        content = f.read()
        if '/sales/customers/' in content:
            print("✓ customerService.js uses correct endpoint")
        else:
            print("✗ customerService.js may use wrong endpoint")
            
    with open('frontend/src/services/supplierService.js', 'r') as f:
        content = f.read()
        if '/purchases/suppliers/' in content:
            print("✓ supplierService.js uses correct endpoint")
        else:
            print("✗ supplierService.js may use wrong endpoint")
            
    print("Service import test completed")
    
except Exception as e:
    print(f"Error testing imports: {e}")
"""
    
    exec(test_script)

def test_registration_flow():
    """Test the registration flow with correct endpoint"""
    print("\n=== Testing Registration Flow (Corrected) ===")
    
    try:
        # Test registration endpoint
        registration_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "testpass123",
            "password_confirm": "testpass123",  # Correct field name
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/register-user/",  # Correct endpoint
            json=registration_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            print("✓ Registration endpoint works")
            
            # Test login with the created user
            login_data = {
                "username": registration_data["username"],
                "password": registration_data["password"]
            }
            
            login_response = requests.post(
                f"{BASE_URL}/api/token/",  # Correct login endpoint
                json=login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if login_response.status_code == 200:
                print("✓ Login endpoint works")
                return True
            else:
                print(f"✗ Login failed: {login_response.status_code}")
                print(login_response.text)
                return False
                
        else:
            print(f"✗ Registration failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"✗ Registration test failed: {e}")
        return False

def check_frontend_console_errors():
    """Check for frontend runtime errors by examining common issues"""
    print("\n=== Checking Frontend Code for Common Errors ===")
    
    issues = []
    
    # Check router.js for missing imports
    try:
        with open('frontend/src/router.js', 'r') as f:
            router_content = f.read()
            
        # Check if all imported components exist
        import re
        imports = re.findall(r"import .+ from ['\"](.+)['\"]", router_content)
        
        for import_path in imports:
            if import_path.startswith('./'):
                full_path = f"frontend/src/{import_path[2:]}"
                if not import_path.endswith('.js'):
                    full_path += '.js'
                
                if not os.path.exists(full_path):
                    issues.append(f"Missing component: {full_path}")
                else:
                    print(f"✓ Found: {full_path}")
                    
    except Exception as e:
        issues.append(f"Error checking router: {e}")
    
    # Check for service endpoint issues
    service_files = [
        'frontend/src/services/customerService.js',
        'frontend/src/services/supplierService.js'
    ]
    
    for service_file in service_files:
        try:
            with open(service_file, 'r') as f:
                content = f.read()
                
            # Check for correct endpoints
            if 'customerService' in service_file:
                if '/customers/customers/' in content:
                    issues.append(f"{service_file}: Uses wrong endpoint /customers/customers/ instead of /sales/customers/")
                elif '/sales/customers/' in content:
                    print(f"✓ {service_file}: Uses correct endpoint")
                    
            if 'supplierService' in service_file:
                if '/suppliers/suppliers/' in content:
                    issues.append(f"{service_file}: Uses wrong endpoint /suppliers/suppliers/ instead of /purchases/suppliers/")
                elif '/purchases/suppliers/' in content:
                    print(f"✓ {service_file}: Uses correct endpoint")
                    
        except Exception as e:
            issues.append(f"Error checking {service_file}: {e}")
    
    return issues

def fix_service_endpoints():
    """Fix service endpoints to use correct URLs"""
    print("\n=== Fixing Service Endpoints ===")
    
    fixes_needed = []
    
    # Fix customerService
    try:
        with open('frontend/src/services/customerService.js', 'r') as f:
            content = f.read()
        
        if '/customers/customers/' in content:
            new_content = content.replace('/customers/customers/', '/sales/customers/')
            with open('frontend/src/services/customerService.js', 'w') as f:
                f.write(new_content)
            print("✓ Fixed customerService.js endpoint")
            fixes_needed.append("customerService endpoint")
        else:
            print("✓ customerService.js endpoint already correct")
            
    except Exception as e:
        print(f"✗ Error fixing customerService: {e}")
    
    # Fix supplierService
    try:
        with open('frontend/src/services/supplierService.js', 'r') as f:
            content = f.read()
        
        if '/suppliers/suppliers/' in content:
            new_content = content.replace('/suppliers/suppliers/', '/purchases/suppliers/')
            with open('frontend/src/services/supplierService.js', 'w') as f:
                f.write(new_content)
            print("✓ Fixed supplierService.js endpoint")
            fixes_needed.append("supplierService endpoint")
        else:
            print("✓ supplierService.js endpoint already correct")
            
    except Exception as e:
        print(f"✗ Error fixing supplierService: {e}")
    
    return fixes_needed

def main():
    print("Starting Enhanced Frontend Error Scan and Fix...")
    print("=" * 60)
    
    # Check if servers are running
    try:
        backend_response = requests.get(f"{BASE_URL}/api/", timeout=5)
        print("✓ Backend server is running")
    except:
        print("✗ Backend server not accessible")
        return
    
    # Fix endpoints first
    fixes_made = fix_service_endpoints()
    
    # Run all checks
    api_results = check_api_endpoints()
    test_frontend_service_imports()
    registration_works = test_registration_flow()
    frontend_issues = check_frontend_console_errors()
    
    # Summary
    print("\n" + "=" * 60)
    print("ENHANCED SCAN SUMMARY")
    print("=" * 60)
    
    accessible_endpoints = len([ep for ep in api_results.values() if ep.get('accessible', False)])
    print(f"API Endpoints: {accessible_endpoints}/{len(api_results)} accessible")
    print(f"Registration/Login: {'✓ Works' if registration_works else '✗ Failed'}")
    print(f"Frontend Issues: {len(frontend_issues)} found")
    
    if fixes_made:
        print(f"Fixes Applied: {', '.join(fixes_made)}")
    
    if frontend_issues:
        print("\nRemaining Issues:")
        for issue in frontend_issues:
            print(f"  - {issue}")
    
    print("\nEnhanced scan complete!")

if __name__ == "__main__":
    main()
