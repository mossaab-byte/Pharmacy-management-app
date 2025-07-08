#!/usr/bin/env python3
"""
Test script for medicine API endpoints
Run this from the backend directory: python test_medicine_api.py
"""

import os
import sys
import django
import requests
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Medicine.models import Medicine
from rest_framework.test import APIClient
from django.test import TestCase
import json

def test_medicine_endpoints():
    """Test the medicine API endpoints"""
    client = APIClient()
    
    # Test basic list endpoint
    print("Testing medicine list endpoint...")
    response = client.get('/medicines/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data.get('results', data))} medicines")
    else:
        print(f"Error: {response.content}")
    
    # Test search endpoint
    print("\nTesting search endpoint...")
    response = client.get('/medicines/?search=test')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Search results: {len(data.get('results', data))} medicines")
    
    # Test quick search endpoint
    print("\nTesting quick search endpoint...")
    response = client.get('/medicines/quick_search/?q=test')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Quick search results: {len(data)} medicines")
    
    # Test search by code endpoint
    print("\nTesting search by code endpoint...")
    response = client.get('/medicines/search_by_code/?code=123')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Code search result: {data}")
    
    # Test statistics endpoint
    print("\nTesting statistics endpoint...")
    response = client.get('/medicines/statistics/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Statistics: {data}")

if __name__ == '__main__':
    print("Starting medicine API tests...")
    test_medicine_endpoints()
    print("Tests completed!")
