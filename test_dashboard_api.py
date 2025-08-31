#!/usr/bin/env python3
"""
Test the dashboard API directly to see what it returns
"""

import requests
import json

def test_dashboard_api():
    print("=== TESTING DASHBOARD API DIRECTLY ===\n")
    
    # Test the KPIs endpoint
    try:
        # You would need to get the actual token from localStorage in browser
        # For now, let's test without auth to see the response structure
        response = requests.get('http://localhost:8000/api/dashboard/kpis/', timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2, default=str))
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_dashboard_api()
