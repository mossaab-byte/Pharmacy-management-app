"""
Test script to verify purchase total calculation fix
"""
import requests
import json

# API base URL
API_BASE = "http://localhost:8000/api"

def test_purchase_creation():
    """Test creating a purchase and verify the total is calculated correctly"""
    
    print("🧪 Testing Purchase Total Calculation Fix")
    print("=" * 50)
    
    try:
        # Step 1: Get the first supplier
        print("1. Getting suppliers...")
        response = requests.get(f"{API_BASE}/purchases/suppliers/")
        if response.status_code == 200:
            suppliers = response.json()
            if 'results' in suppliers:
                suppliers = suppliers['results']
            
            if suppliers:
                supplier = suppliers[0]
                print(f"   ✅ Using supplier: {supplier['name']} (ID: {supplier['id']})")
            else:
                print("   ❌ No suppliers found")
                return
        else:
            print(f"   ❌ Failed to get suppliers: {response.status_code}")
            return
        
        # Step 2: Get some medicines
        print("2. Getting medicines...")
        response = requests.get(f"{API_BASE}/medicine/medicines/search_all/?limit=5")
        if response.status_code == 200:
            medicines_data = response.json()
            medicines = medicines_data if isinstance(medicines_data, list) else medicines_data.get('results', [])
            
            if medicines:
                print(f"   ✅ Found {len(medicines)} medicines")
                # Take first 2 medicines for test
                test_medicines = medicines[:2]
            else:
                print("   ❌ No medicines found")
                return
        else:
            print(f"   ❌ Failed to get medicines: {response.status_code}")
            return
        
        # Step 3: Create a purchase with items
        print("3. Creating purchase...")
        purchase_data = {
            "supplier": supplier['id'],
            "items": [
                {
                    "medicine": test_medicines[0]['id'],
                    "quantity": 10,
                    "unit_cost": 25.50
                },
                {
                    "medicine": test_medicines[1]['id'],
                    "quantity": 5,
                    "unit_cost": 15.75
                }
            ]
        }
        
        # Calculate expected total
        expected_total = (10 * 25.50) + (5 * 15.75)
        print(f"   Expected total: {expected_total} DH")
        
        response = requests.post(f"{API_BASE}/purchases/purchases/", 
                               json=purchase_data,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 201:
            purchase = response.json()
            print(f"   ✅ Purchase created: {purchase['id']}")
            print(f"   📊 Total amount: {purchase.get('total_amount', 'NOT SET')} DH")
            print(f"   📊 Total field: {purchase.get('total', 'NOT SET')} DH")
            print(f"   📊 Items count: {len(purchase.get('items', []))}")
            
            if purchase.get('total_amount') == expected_total:
                print("   ✅ Total calculation is CORRECT!")
            else:
                print(f"   ❌ Total calculation is WRONG! Expected {expected_total}, got {purchase.get('total_amount')}")
        else:
            print(f"   ❌ Failed to create purchase: {response.status_code}")
            print(f"   Response: {response.text}")
            return
        
        # Step 4: Get all purchases to verify display data
        print("4. Testing purchase list...")
        response = requests.get(f"{API_BASE}/purchases/purchases/")
        if response.status_code == 200:
            purchases_data = response.json()
            purchases = purchases_data.get('results', []) if isinstance(purchases_data, dict) else purchases_data
            
            print(f"   ✅ Found {len(purchases)} purchases")
            
            # Check our newly created purchase
            our_purchase = None
            for p in purchases:
                if p['id'] == purchase['id']:
                    our_purchase = p
                    break
            
            if our_purchase:
                print(f"   📊 In list - Total amount: {our_purchase.get('total_amount', 'NOT SET')} DH")
                print(f"   📊 In list - Total field: {our_purchase.get('total', 'NOT SET')} DH")
                print(f"   📊 In list - Supplier name: {our_purchase.get('supplier_name', 'NOT SET')}")
                print(f"   📊 In list - Items count: {our_purchase.get('items_count', 'NOT SET')}")
                print(f"   📊 In list - Status: {our_purchase.get('status', 'NOT SET')}")
                
                if our_purchase.get('total') == expected_total or our_purchase.get('total_amount') == expected_total:
                    print("   ✅ Purchase list display is CORRECT!")
                else:
                    print(f"   ❌ Purchase list display is WRONG!")
            else:
                print("   ❌ Could not find our purchase in the list")
                
        else:
            print(f"   ❌ Failed to get purchase list: {response.status_code}")
        
        print("\n🎉 Test completed!")
        print("Now check the frontend at http://localhost:3333/purchases")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_purchase_creation()
