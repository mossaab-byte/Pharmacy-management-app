import requests
import json

def test_api_endpoints():
    """Test API endpoints directly"""
    print("🔍 TESTING API ENDPOINTS DIRECTLY")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    # Get token (assuming we can use one from localStorage or test without auth)
    headers = {
        'Content-Type': 'application/json',
    }
    
    # Test if server is running
    try:
        response = requests.get(f"{base_url}/api/", timeout=5)
        print(f"✅ Server is running: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not reachable: {str(e)}")
        return
    
    # Test sales endpoint
    try:
        print("\n📊 Testing Sales API...")
        response = requests.get(f"{base_url}/api/sales/sales/", headers=headers, timeout=10)
        print(f"Sales API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sales API working! Found {len(data) if isinstance(data, list) else 'unknown'} sales")
            if isinstance(data, list) and data:
                print(f"Sample sale: {json.dumps(data[0], indent=2)}")
        else:
            print(f"❌ Sales API error: {response.text}")
            
    except Exception as e:
        print(f"❌ Sales API failed: {str(e)}")
    
    # Test inventory endpoint
    try:
        print("\n📦 Testing Inventory API...")
        response = requests.get(f"{base_url}/api/pharmacy/pharmacy-medicines/", headers=headers, timeout=10)
        print(f"Inventory API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else len(data.get('results', [])) if isinstance(data, dict) else 'unknown'
            print(f"✅ Inventory API working! Found {count} items")
        else:
            print(f"❌ Inventory API error: {response.text}")
            
    except Exception as e:
        print(f"❌ Inventory API failed: {str(e)}")

if __name__ == '__main__':
    test_api_endpoints()
