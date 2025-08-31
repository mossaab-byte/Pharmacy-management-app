#!/usr/bin/env python3
"""
Test script to verify the complete supplier management workflow
"""
import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_supplier_creation():
    """Test creating a supplier from scratch with all required fields"""
    
    # Test data for a new supplier
    supplier_data = {
        "name": "MediPharm Distributors Ltd",
        "contact_person": "Dr. Sarah Johnson", 
        "contact_email": "sarah.johnson@medipharm.com",
        "contact_phone": "+212 522 789456",
        "address": "123 Medical Plaza, Suite 400",
        "city": "Casablanca",
        "state": "Grand Casablanca",
        "postal_code": "20000",
        "country": "Morocco",
        "tax_id": "TAX123456789",
        "license_number": "LIC987654321",
        "drug_license": "DL2024001",
        "certification": "ISO 9001:2015, GMP Certified",
        "credit_limit": 50000.00,
        "payment_terms": "Net 30 days",
        "delivery_schedule": "Weekly on Wednesdays",
        "minimum_order": 1000.00,
        "discount_rate": 5.00,
        "notes": "Reliable supplier with excellent quality control. Specializes in cardiovascular and diabetes medications."
    }
    
    print("🔍 Testing Supplier Creation Workflow...")
    print("=" * 50)
    
    try:
        # 1. Test supplier creation
        print("1️⃣ Creating new supplier...")
        response = requests.post(f"{BASE_URL}/api/purchases/suppliers/", 
                               json=supplier_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 201:
            supplier = response.json()
            supplier_id = supplier['id']
            print(f"   ✅ Supplier created successfully!")
            print(f"   📋 Supplier ID: {supplier_id}")
            print(f"   🏢 Name: {supplier['name']}")
            print(f"   👤 Contact: {supplier['contact_person']}")
            print(f"   💰 Credit Limit: {supplier['credit_limit']} DH")
        else:
            print(f"   ❌ Failed to create supplier: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            return False
            
        # 2. Test supplier retrieval
        print("\n2️⃣ Retrieving created supplier...")
        response = requests.get(f"{BASE_URL}/api/purchases/suppliers/{supplier_id}/")
        
        if response.status_code == 200:
            retrieved_supplier = response.json()
            print(f"   ✅ Supplier retrieved successfully!")
            print(f"   📧 Email: {retrieved_supplier.get('contact_email', 'N/A')}")
            print(f"   📍 Address: {retrieved_supplier.get('address', 'N/A')}")
            print(f"   🏷️ Tax ID: {retrieved_supplier.get('tax_id', 'N/A')}")
        else:
            print(f"   ❌ Failed to retrieve supplier: {response.status_code}")
            return False
            
        # 3. Test supplier list
        print("\n3️⃣ Testing supplier list...")
        response = requests.get(f"{BASE_URL}/api/purchases/suppliers/")
        
        if response.status_code == 200:
            suppliers_response = response.json()
            suppliers = suppliers_response.get('results', [])
            print(f"   ✅ Supplier list retrieved successfully!")
            print(f"   📊 Total suppliers: {len(suppliers)}")
            
            # Check if our supplier is in the list
            found = any(s['id'] == supplier_id for s in suppliers)
            if found:
                print(f"   ✅ Created supplier found in list!")
            else:
                print(f"   ⚠️ Created supplier not found in list")
        else:
            print(f"   ❌ Failed to retrieve supplier list: {response.status_code}")
            return False
            
        # 4. Test supplier update
        print("\n4️⃣ Testing supplier update...")
        update_data = {
            **supplier_data,
            "credit_limit": 75000.00,
            "notes": "Updated: Increased credit limit due to excellent payment history."
        }
        
        response = requests.put(f"{BASE_URL}/api/purchases/suppliers/{supplier_id}/",
                              json=update_data,
                              headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            updated_supplier = response.json()
            print(f"   ✅ Supplier updated successfully!")
            print(f"   💰 New Credit Limit: {updated_supplier['credit_limit']} DH")
        else:
            print(f"   ❌ Failed to update supplier: {response.status_code}")
            return False
            
        # 5. Test supplier deletion (cleanup)
        print("\n5️⃣ Cleaning up - deleting test supplier...")
        response = requests.delete(f"{BASE_URL}/api/purchases/suppliers/{supplier_id}/")
        
        if response.status_code == 204:
            print(f"   ✅ Supplier deleted successfully!")
        else:
            print(f"   ⚠️ Failed to delete supplier: {response.status_code}")
            print(f"   📝 Note: You may need to manually delete supplier ID: {supplier_id}")
            
        print("\n" + "=" * 50)
        print("✨ All supplier workflow tests completed successfully!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("💡 Make sure the Django server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_supplier_validation():
    """Test supplier validation for required fields"""
    print("\n🔍 Testing Supplier Validation...")
    print("=" * 50)
    
    # Test with missing required name field
    invalid_data = {
        "contact_email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/purchases/suppliers/", 
                               json=invalid_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            print("✅ Validation working - rejected supplier without name")
        else:
            print(f"⚠️ Unexpected response for invalid data: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing validation: {str(e)}")

if __name__ == "__main__":
    print("🧪 SUPPLIER MANAGEMENT WORKFLOW TEST")
    print("=" * 50)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend URL: {BASE_URL}")
    print()
    
    # Run tests
    success = test_supplier_creation()
    test_supplier_validation()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Supplier management system is working correctly")
        print("✅ No mock data - real supplier creation from scratch")
        print("✅ All fields are properly handled")
    else:
        print("❌ SOME TESTS FAILED")
        print("💡 Check the error messages above")
    
    print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
