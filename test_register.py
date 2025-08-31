import requests
import json

def test_register():
    register_data = {
        "username": "testregister2",
        "email": "test2@register.com",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    print("Testing user registration...")
    response = requests.post("http://localhost:8000/api/register-user/", json=register_data)
    print(f"Registration status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code != 201:
        print("Registration failed!")
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            pass
    else:
        print("Registration successful!")

if __name__ == "__main__":
    test_register()
