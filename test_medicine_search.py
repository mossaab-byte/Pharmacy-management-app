#!/usr/bin/env python3
"""
Frontend Medicine Search Debug Test
"""

import requests
import json

def test_medicine_api_directly():
    """Test the medicine API that frontend should be calling"""
    print("🔍 Testing Medicine API for Frontend Forms")
    print("=" * 50)
    
    # First test without auth (should work)
    print("1️⃣ Testing Medicine API without authentication...")
    try:
        response = requests.get("http://localhost:8000/api/medicine/medicines/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            total = data.get('count', len(data) if isinstance(data, list) else 0)
            print(f"   ✅ Medicines available: {total}")
            
            # Show sample medicine data structure
            results = data.get('results', data) if isinstance(data, dict) else data
            if results and len(results) > 0:
                sample = results[0]
                print(f"   📋 Sample medicine structure:")
                print(f"      ID: {sample.get('id')}")
                print(f"      Nom: {sample.get('nom', 'N/A')}")
                print(f"      DCI: {sample.get('dci1', 'N/A')}")
                print(f"      Prix: {sample.get('prix_public', 'N/A')}")
                print(f"      Stock: {sample.get('stock', 'N/A')}")
                
                # Test search functionality
                print(f"\n   🔍 Testing search patterns...")
                search_terms = ['dol', 'paracetamol', 'aspirin']
                for term in search_terms:
                    matches = [m for m in results[:100] if term.lower() in str(m.get('nom', '')).lower() or 
                                                          term.lower() in str(m.get('dci1', '')).lower()]
                    print(f"      '{term}': {len(matches)} matches found")
            
        else:
            print(f"   ❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def test_frontend_service_call():
    """Test the exact call that frontend medicineService makes"""
    print(f"\n2️⃣ Testing Frontend Service Call Pattern...")
    print("-" * 30)
    
    # Simulate what the frontend medicineService.getAll() does
    try:
        # This should match what's in medicineService.js
        response = requests.get("http://localhost:8000/api/medicine/medicines/")
        print(f"   API Call: GET /api/medicine/medicines/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response received")
            
            # Check if it's paginated
            if isinstance(data, dict) and 'results' in data:
                medicines = data['results']
                print(f"   📊 Paginated response: {len(medicines)} of {data.get('count')} total")
            elif isinstance(data, list):
                medicines = data
                print(f"   📊 Array response: {len(medicines)} medicines")
            else:
                print(f"   ⚠️  Unexpected response format: {type(data)}")
                return
            
            # Test what frontend search would do
            if medicines:
                print(f"\n   🔍 Testing frontend search logic...")
                search_term = "dol"
                filtered = [med for med in medicines if 
                           len(search_term) >= 2 and (
                               med.get('nom', '').lower().find(search_term.lower()) != -1 or
                               med.get('nom_commercial', '').lower().find(search_term.lower()) != -1 or
                               med.get('dci1', '').lower().find(search_term.lower()) != -1
                           )]
                print(f"      Search term '{search_term}': {len(filtered)} matches")
                
                if filtered:
                    sample = filtered[0]
                    print(f"      Sample match: {sample.get('nom')} - {sample.get('dci1')}")
                else:
                    print(f"      No matches found for '{search_term}'")
        else:
            print(f"   ❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def test_with_authentication():
    """Test with authentication in case that's required"""
    print(f"\n3️⃣ Testing with Authentication...")
    print("-" * 30)
    
    # Register and get token
    registration_data = {
        "username": "searchtest123",
        "email": "searchtest123@example.com", 
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    try:
        # Register or login
        response = requests.post(
            "http://localhost:8000/api/register-user/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            token = data['access']
        else:
            # Try login instead
            login_data = {
                "username": "searchtest123",
                "password": "testpass123"
            }
            response = requests.post(
                "http://localhost:8000/api/token/",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                token = response.json()['access']
            else:
                print("   ❌ Could not get authentication token")
                return
        
        # Test with auth
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("http://localhost:8000/api/medicine/medicines/", headers=headers)
        
        print(f"   With Auth - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', len(data) if isinstance(data, list) else 0)
            print(f"   ✅ Authenticated access: {count} medicines")
        else:
            print(f"   ❌ Auth failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def main():
    """Run all medicine search tests"""
    print("🎯 Frontend Medicine Search Debug")
    print("=" * 50)
    
    test_medicine_api_directly()
    test_frontend_service_call()
    test_with_authentication()
    
    print(f"\n🎉 Medicine Search Tests Complete!")
    print("=" * 50)
    print("💡 If medicine search still doesn't work in frontend:")
    print("   1. Check browser console for JavaScript errors")
    print("   2. Verify medicines state is populated after API call")
    print("   3. Check if search input is properly connected")
    print("   4. Ensure filteredMedicines array is not empty")
    print("   5. Check if search results div is visible")

if __name__ == "__main__":
    main()
