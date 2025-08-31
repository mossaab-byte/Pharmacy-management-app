#!/usr/bin/env python3
"""
Test script for employee management functionality
"""
import requests
import json

# Test the employee management system
base_url = "http://localhost:8000"

# Login credentials 
login_data = {
    "username": "testpharmacist",
    "password": "testpass123"
}

def test_employee_management():
    session = requests.Session()
    
    try:
        # Login
        print("🔐 Logging in...")
        login_response = session.post(f'{base_url}/api/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
            
        auth_data = login_response.json()
        access_token = auth_data.get('access')
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Test 1: Get current user
        print("\n👤 Testing current user endpoint...")
        user_response = requests.get(f"{base_url}/api/users/current-user/", headers=headers)
        print(f"Current user status: {user_response.status_code}")
        
        if user_response.status_code == 200:
            user_data = user_response.json()
            print(f"✅ Current user: {user_data.get('username')}")
            print(f"   Permissions: {user_data.get('permissions', {})}")
        else:
            print(f"❌ Current user failed: {user_response.text}")
        
        # Test 2: Get all employees
        print("\n👥 Testing get all employees...")
        employees_response = requests.get(f"{base_url}/api/users/", headers=headers)
        print(f"Employees status: {employees_response.status_code}")
        
        if employees_response.status_code == 200:
            employees_data = employees_response.json()
            employees = employees_data if isinstance(employees_data, list) else employees_data.get('results', [])
            print(f"✅ Found {len(employees)} employees")
            for emp in employees:
                print(f"   - {emp.get('username')}: {emp.get('email')}")
        else:
            print(f"❌ Get employees failed: {employees_response.text}")
        
        # Test 3: Get manager permissions
        print("\n🛡️ Testing manager permissions...")
        managers_response = requests.get(f"{base_url}/api/pharmacy/managers/", headers=headers)
        print(f"Managers status: {managers_response.status_code}")
        
        if managers_response.status_code == 200:
            managers_data = managers_response.json()
            managers = managers_data if isinstance(managers_data, list) else managers_data.get('results', [])
            print(f"✅ Found {len(managers)} manager permissions")
            for mgr in managers:
                print(f"   - Manager: {mgr}")
        else:
            print(f"❌ Get managers failed: {managers_response.text}")
        
        # Test 4: Create a test employee
        print("\n➕ Testing create employee...")
        test_employee = {
            "username": "testemployee",
            "email": "employee@test.com",
            "first_name": "Test",
            "last_name": "Employee",
            "password": "employee123",
            "is_manager": False,
            "can_manage_sales": True,
            "can_manage_inventory": False,
            "can_manage_purchases": False,
            "can_manage_users": False,
            "can_view_reports": False
        }
        
        create_response = requests.post(f"{base_url}/api/users/", json=test_employee, headers=headers)
        print(f"Create employee status: {create_response.status_code}")
        
        if create_response.status_code == 201:
            created_employee = create_response.json()
            print(f"✅ Created employee: {created_employee.get('username')}")
            
            # Test 5: Update employee permissions
            employee_id = created_employee.get('id')
            print(f"\n🔧 Testing update permissions for employee {employee_id}...")
            
            update_permissions = {
                "can_manage_inventory": True,
                "can_view_reports": True
            }
            
            update_response = requests.patch(f"{base_url}/api/users/{employee_id}/", json=update_permissions, headers=headers)
            print(f"Update permissions status: {update_response.status_code}")
            
            if update_response.status_code == 200:
                print("✅ Permissions updated successfully")
            else:
                print(f"❌ Update permissions failed: {update_response.text}")
                
        else:
            print(f"❌ Create employee failed: {create_response.text}")
        
        print("\n🎉 Employee management testing completed!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    test_employee_management()
