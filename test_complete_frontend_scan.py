#!/usr/bin/env python3
"""
Comprehensive Frontend Error Scanner
This script systematically tests all frontend components and API endpoints
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
    """Test all backend API endpoints that frontend depends on"""
    print("\n=== Testing Backend API Endpoints ===")
    
    endpoints = [
        "/api/auth/register/",
        "/api/auth/login/",
        "/api/sales/sales/",
        "/api/purchases/purchases/",
        "/api/medicine/medicines/",
        "/api/medicine/medicines/search_all/",
        "/api/customers/customers/",
        "/api/suppliers/suppliers/",
        "/api/inventory/inventory/",
        "/api/finance/finance/",
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

def check_frontend_build():
    """Check if frontend builds without errors"""
    print("\n=== Checking Frontend Build ===")
    
    try:
        # Change to frontend directory
        frontend_dir = "frontend"
        
        # Run webpack build
        result = subprocess.run(
            ["npm", "run", "build"], 
            cwd=frontend_dir,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✓ Frontend builds successfully")
            return True
        else:
            print("✗ Frontend build failed:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"✗ Build check failed: {e}")
        return False

def check_service_files():
    """Check all service files for common errors"""
    print("\n=== Checking Service Files ===")
    
    service_files = [
        "frontend/src/services/apiClient.js",
        "frontend/src/services/authService.js", 
        "frontend/src/services/salesServices.js",
        "frontend/src/services/customerService.js",
        "frontend/src/services/supplierService.js",
        "frontend/src/services/medicineService.js",
        "frontend/src/services/purchaseService.js",
        "frontend/src/services/inventoryService.js",
    ]
    
    issues = []
    
    for file_path in service_files:
        if os.path.exists(file_path):
            print(f"Checking {file_path}...")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for common issues
                if 'export default' not in content and 'module.exports' not in content:
                    issues.append(f"{file_path}: No default export found")
                
                if '.data.results' in content and 'Array.isArray' not in content:
                    issues.append(f"{file_path}: Potential pagination handling issue")
                
                if 'getAll' in content and 'medicineService' in file_path:
                    print(f"✓ {file_path}: Has getAll method")
                    
        else:
            issues.append(f"{file_path}: File not found")
    
    if issues:
        print("Issues found:")
        for issue in issues:
            print(f"  ✗ {issue}")
    else:
        print("✓ All service files look good")
    
    return issues

def check_component_imports():
    """Check component files for import/export issues"""
    print("\n=== Checking Component Imports ===")
    
    # Key component files to check
    component_files = [
        "frontend/src/components/sales/SimpleStableSalesForm.js",
        "frontend/src/components/purchases/ComprehensivePurchaseForm.js",
        "frontend/src/components/customers/customerTable.js",
        "frontend/src/components/suppliers/supplierManagement.js",
        "frontend/src/components/auth/register.js",
        "frontend/src/components/auth/login.js",
    ]
    
    issues = []
    
    for file_path in component_files:
        if os.path.exists(file_path):
            print(f"Checking {file_path}...")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for service imports
                if 'medicineService' in content:
                    if 'import medicineService from' not in content and 'import { medicineService }' not in content:
                        issues.append(f"{file_path}: Potential medicineService import issue")
                
                # Check for common React issues
                if 'useState' in content and 'import' not in content.split('\n')[0]:
                    issues.append(f"{file_path}: React hooks used but import may be missing")
                
        else:
            issues.append(f"{file_path}: File not found")
    
    if issues:
        print("Issues found:")
        for issue in issues:
            print(f"  ✗ {issue}")
    else:
        print("✓ Component imports look good")
    
    return issues

def test_registration_flow():
    """Test the registration flow end-to-end"""
    print("\n=== Testing Registration Flow ===")
    
    try:
        # Test registration endpoint
        registration_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "testpass123",
            "password2": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=registration_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            print("✓ Registration endpoint works")
            return True
        else:
            print(f"✗ Registration failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"✗ Registration test failed: {e}")
        return False

def test_medicine_search():
    """Test medicine search functionality"""
    print("\n=== Testing Medicine Search ===")
    
    try:
        # Test search_all endpoint
        response = requests.get(f"{BASE_URL}/api/medicine/medicines/search_all/")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✓ Medicine search returns {len(data)} medicines as array")
                
                # Check if medicines have required fields
                if data and len(data) > 0:
                    medicine = data[0]
                    required_fields = ['nom', 'prix_public', 'stock']
                    missing_fields = [field for field in required_fields if field not in medicine]
                    
                    if missing_fields:
                        print(f"✗ Medicine missing fields: {missing_fields}")
                        return False
                    else:
                        print("✓ Medicine objects have required fields")
                        return True
                else:
                    print("⚠ No medicines found in database")
                    return True
            else:
                print(f"✗ Medicine search returns non-array: {type(data)}")
                return False
        else:
            print(f"✗ Medicine search failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Medicine search test failed: {e}")
        return False

def main():
    print("Starting Comprehensive Frontend Error Scan...")
    print("=" * 50)
    
    # Check if servers are running
    try:
        backend_response = requests.get(f"{BASE_URL}/api/", timeout=5)
        print("✓ Backend server is running")
    except:
        print("✗ Backend server not accessible")
        return
    
    # Run all checks
    api_results = check_api_endpoints()
    build_success = check_frontend_build()
    service_issues = check_service_files()
    component_issues = check_component_imports()
    registration_works = test_registration_flow()
    medicine_search_works = test_medicine_search()
    
    # Summary
    print("\n" + "=" * 50)
    print("SCAN SUMMARY")
    print("=" * 50)
    
    total_endpoints = len([ep for ep in api_results.values() if ep.get('accessible', False)])
    print(f"API Endpoints: {total_endpoints}/{len(api_results)} accessible")
    print(f"Frontend Build: {'✓ Success' if build_success else '✗ Failed'}")
    print(f"Service Files: {'✓ Good' if not service_issues else f'✗ {len(service_issues)} issues'}")
    print(f"Component Files: {'✓ Good' if not component_issues else f'✗ {len(component_issues)} issues'}")
    print(f"Registration: {'✓ Works' if registration_works else '✗ Failed'}")
    print(f"Medicine Search: {'✓ Works' if medicine_search_works else '✗ Failed'}")
    
    # Detailed issues
    if service_issues or component_issues:
        print("\nISSUES TO FIX:")
        for issue in service_issues + component_issues:
            print(f"  - {issue}")
    
    print("\nScan complete!")

if __name__ == "__main__":
    main()
