import requests
import json

def test_login_and_employees():
    # Test login
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    print("Testing login...")
    response = requests.post("http://localhost:8000/api/token/", json=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"Login successful! Token: {token[:20]}...")
        
        # Test authenticated endpoints
        headers = {'Authorization': f'Bearer {token}'}
        
        print("\nTesting /api/users/ endpoint...")
        users_response = requests.get("http://localhost:8000/api/users/", headers=headers)
        print(f"Users endpoint status: {users_response.status_code}")
        if users_response.status_code == 200:
            users_data = users_response.json()
            print(f"Found {len(users_data)} users")
        
        print("\nTesting /api/current-user/ endpoint...")
        current_user_response = requests.get("http://localhost:8000/api/current-user/", headers=headers)
        print(f"Current user endpoint status: {current_user_response.status_code}")
        if current_user_response.status_code == 200:
            user_data = current_user_response.json()
            print(f"Current user: {user_data.get('username')}")
        
        print("\nTesting /api/pharmacy/managers/ endpoint...")
        managers_response = requests.get("http://localhost:8000/api/pharmacy/managers/", headers=headers)
        print(f"Managers endpoint status: {managers_response.status_code}")
        
    else:
        print(f"Login failed: {response.text}")

if __name__ == "__main__":
    test_login_and_employees()
