#!/usr/bin/env python
import requests
import json

def test_supplier_transactions_api():
    print("=== TESTING SUPPLIER TRANSACTIONS API ===")
    
    # First, let's get the supplier ID
    supplier_id = "1747770f-2ad0-4ed7-bc66-cb38ac0d8e07"  # genphar ID from diagnostic
    
    try:
        # Test the transactions endpoint directly
        print(f"1. Testing transactions endpoint for supplier {supplier_id}...")
        
        # Try without authentication first to see the endpoint structure
        try:
            response = requests.get(f'http://localhost:8000/api/purchases/suppliers/{supplier_id}/transactions/')
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Transactions data: {json.dumps(data, indent=2, default=str)}")
            elif response.status_code == 401:
                print("❌ Authentication required - this is expected")
            else:
                print(f"❌ Unexpected status: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
            
        # Test the supplier detail endpoint to compare
        print(f"\n2. Testing supplier detail endpoint...")
        try:
            response = requests.get(f'http://localhost:8000/api/purchases/suppliers/{supplier_id}/')
            print(f"Supplier response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Supplier data: {json.dumps(data, indent=2, default=str)}")
            else:
                print(f"❌ Supplier request failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Supplier request failed: {e}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_supplier_transactions_api()
