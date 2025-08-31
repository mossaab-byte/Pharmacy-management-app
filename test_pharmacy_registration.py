#!/usr/bin/env python3
"""
Test script for pharmacy registration functionality
"""
import requests
import json
import sys

BASE_URL = 'http://localhost:8000/api'

def test_user_registration():
    """Test user registration first"""
    print("=== Testing User Registration ===")
    
    user_data = {
        "username": "testpharmacist@test.com",
        "email": "testpharmacist@test.com", 
        "password": "testpassword123",
        "password_confirm": "testpassword123"
    }
    
    try:
        response = requests.post(f'{BASE_URL}/register-user/', json=user_data)
        print(f"User registration status: {response.status_code}")
        
        if response.status_code == 201:
            print("✓ User registration successful")
            return True
        elif response.status_code == 400:
            error_data = response.json()
            if 'username' in error_data and 'already exists' in str(error_data['username']):
                print("✓ User already exists, continuing...")
                return True
            else:
                print(f"✗ User registration failed: {error_data}")
                return False
        else:
            print(f"✗ User registration failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error during user registration: {e}")
        return False

def test_user_login():
    """Test user login to get auth token"""
    print("\n=== Testing User Login ===")
    
    login_data = {
        "username": "testpharmacist@test.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f'{BASE_URL}/token/', json=login_data)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Login successful")
            return data.get('access')
        else:
            print(f"✗ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"✗ Error during login: {e}")
        return None

def test_pharmacy_registration(token):
    """Test pharmacy registration with auth token"""
    print("\n=== Testing Pharmacy Registration ===")
    
    pharmacy_data = {
        "name": "Test Pharmacy",
        "address": "123 Test Street, Test City",
        "phone": "123-456-7890"
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/pharmacies/register/', 
                               json=pharmacy_data, 
                               headers=headers)
        print(f"Pharmacy registration status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✓ Pharmacy registration successful")
            return True
        else:
            print(f"✗ Pharmacy registration failed")
            return False
            
    except Exception as e:
        print(f"✗ Error during pharmacy registration: {e}")
        return False

def main():
    print("Testing Pharmacy Registration System")
    print("=" * 50)
    
    # Test user registration
    if not test_user_registration():
        print("\n❌ User registration failed, cannot continue")
        sys.exit(1)
    
    # Test user login
    token = test_user_login()
    if not token:
        print("\n❌ Login failed, cannot continue")
        sys.exit(1)
    
    # Test pharmacy registration
    if test_pharmacy_registration(token):
        print("\n✅ All tests passed! Pharmacy registration is working.")
    else:
        print("\n❌ Pharmacy registration failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
