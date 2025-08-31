#!/usr/bin/env python3
import requests
import json

# Test the purchases API endpoint
url = "http://localhost:8000/api/purchases/purchases/?page=1&page_size=5"

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ API call successful!")
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        if 'results' in data:
            print(f"Number of results: {len(data['results'])}")
            if data['results']:
                print("First purchase structure:")
                first_purchase = data['results'][0]
                print(json.dumps(first_purchase, indent=2, default=str))
        else:
            print("Response data:")
            print(json.dumps(data, indent=2, default=str))
    else:
        print(f"❌ API call failed with status {response.status_code}")
        print("Response text:")
        print(response.text[:1000])  # First 1000 chars
        
except requests.exceptions.ConnectionError:
    print("❌ Connection failed. Make sure the Django server is running on localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}")
