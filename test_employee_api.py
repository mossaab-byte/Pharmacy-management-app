import requests
import json

# Test the API endpoints
BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    print("Testing Employee API endpoints...")
    
    # Test basic authentication
    try:
        response = requests.get(f"{BASE_URL}/users/")
        print(f"GET /api/users/ - Status: {response.status_code}")
        if response.status_code == 401:
            print("Authentication required")
        elif response.status_code == 200:
            print(f"Success - Found {len(response.json())} users")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error testing /api/users/: {e}")
    
    # Test current user endpoint
    try:
        response = requests.get(f"{BASE_URL}/current-user/")
        print(f"GET /api/current-user/ - Status: {response.status_code}")
        if response.status_code == 401:
            print("Authentication required")
        elif response.status_code == 200:
            print(f"Current user: {response.json()}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error testing /api/current-user/: {e}")
    
    # Test manager permissions
    try:
        response = requests.get(f"{BASE_URL}/pharmacy/managers/")
        print(f"GET /api/pharmacy/managers/ - Status: {response.status_code}")
        if response.status_code == 401:
            print("Authentication required")
        elif response.status_code == 200:
            print(f"Manager permissions: {response.json()}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error testing /api/pharmacy/managers/: {e}")

if __name__ == "__main__":
    test_endpoints()
