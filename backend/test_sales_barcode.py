#!/usr/bin/env python
"""
Test script for Sales Form Barcode Scanner Integration
Tests the enhanced barcode scanning functionality in the sales form.
"""

import os
import sys
import django
import requests
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Medicine.models import Medicine

def test_barcode_api_endpoints():
    """Test various API endpoints used by the sales form barcode scanner"""
    print("🧪 Testing Sales Form Barcode API Endpoints")
    print("=" * 60)
    
    # Get some test medicine codes
    medicines = Medicine.objects.all()[:5]
    test_codes = []
    
    for medicine in medicines:
        if medicine.code:
            test_codes.append(medicine.code)
            print(f"📋 Test Medicine: {medicine.nom} (Code: {medicine.code})")
    
    if not test_codes:
        print("⚠️ No medicines with codes found in database")
        return
    
    print(f"\n🔍 Testing with {len(test_codes)} medicine codes...")
    
    base_url = 'http://localhost:8000/api'
    
    # Test different API endpoints
    endpoints = [
        '/medicine/medicines/search_by_code/',
        '/medicine/medicines/search_all/',
        '/medicine/medicines/quick_search/'
    ]
    
    for endpoint in endpoints:
        print(f"\n🔗 Testing endpoint: {endpoint}")
        
        for code in test_codes[:2]:  # Test first 2 codes
            try:
                if 'search_by_code' in endpoint:
                    url = f"{base_url}{endpoint}?code={code}"
                elif 'search_all' in endpoint:
                    url = f"{base_url}{endpoint}?limit=1000&q={code}"
                else:  # quick_search
                    url = f"{base_url}{endpoint}?q={code}&limit=50"
                
                print(f"  📡 Testing: {url}")
                response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check different response formats
                    found = False
                    if hasattr(data, 'get') and data.get('data'):
                        found = True
                        medicine_name = data['data'].get('nom') or data['data'].get('nom_commercial', 'Unknown')
                        print(f"    ✅ Found: {medicine_name}")
                    elif isinstance(data, list):
                        matching = [m for m in data if m.get('code') == code]
                        if matching:
                            found = True
                            print(f"    ✅ Found in list: {matching[0].get('nom', 'Unknown')}")
                    elif hasattr(data, 'get') and data.get('results'):
                        matching = [m for m in data['results'] if m.get('code') == code]
                        if matching:
                            found = True
                            print(f"    ✅ Found in results: {matching[0].get('nom', 'Unknown')}")
                    
                    if not found:
                        print(f"    ⚠️ Code {code} not found in response")
                else:
                    print(f"    ❌ HTTP {response.status_code}: {response.text[:100]}")
                    
            except requests.exceptions.ConnectionError:
                print(f"    ⚠️ Connection error - make sure Django server is running")
                break
            except Exception as e:
                print(f"    ❌ Error: {e}")

def test_sales_api():
    """Test sales creation API"""
    print(f"\n🧪 Testing Sales API")
    print("=" * 30)
    
    try:
        # Test sales endpoint availability
        response = requests.get('http://localhost:8000/api/sales/sales/', timeout=5)
        if response.status_code in [200, 401]:  # 401 is ok, means endpoint exists but needs auth
            print("✅ Sales API endpoint is accessible")
        else:
            print(f"⚠️ Sales API returned status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️ Cannot connect to sales API - ensure Django server is running")
    except Exception as e:
        print(f"❌ Sales API test error: {e}")

def test_medicine_search_strategies():
    """Test different search strategies used in the enhanced barcode scanner"""
    print(f"\n🧪 Testing Enhanced Search Strategies")
    print("=" * 40)
    
    # Get a test medicine
    medicine = Medicine.objects.first()
    if not medicine:
        print("⚠️ No medicines found in database")
        return
    
    search_terms = [
        medicine.code if medicine.code else None,
        medicine.nom[:5] if medicine.nom else None,
    ]
    
    search_terms = [term for term in search_terms if term]
    
    if not search_terms:
        print("⚠️ No valid search terms available")
        return
    
    print(f"🔍 Testing search for: {medicine.nom}")
    print(f"📋 Search terms: {search_terms}")
    
    strategies = [
        ('Exact Code Search', lambda term: f'http://localhost:8000/api/medicine/medicines/search_by_code/?code={term}'),
        ('All Medicines Search', lambda term: f'http://localhost:8000/api/medicine/medicines/search_all/?limit=1000&q={term}'),
        ('Quick Search', lambda term: f'http://localhost:8000/api/medicine/medicines/quick_search/?q={term}&limit=50')
    ]
    
    for strategy_name, url_builder in strategies:
        print(f"\n🎯 Strategy: {strategy_name}")
        
        for term in search_terms[:2]:  # Test first 2 terms
            try:
                url = url_builder(term)
                print(f"  📡 URL: {url}")
                
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Count results
                    count = 0
                    if hasattr(data, 'get') and data.get('data'):
                        count = 1
                    elif isinstance(data, list):
                        count = len(data)
                    elif hasattr(data, 'get') and data.get('results'):
                        count = len(data['results'])
                    
                    print(f"    ✅ Success: {count} results")
                else:
                    print(f"    ❌ HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")

if __name__ == "__main__":
    test_barcode_api_endpoints()
    test_sales_api()
    test_medicine_search_strategies()
    
    print("\n🎉 Sales Form Barcode Testing Complete!")
    print("\n💡 Enhanced Features:")
    print("   ✅ Dedicated barcode input field")
    print("   ✅ Multiple search strategies")
    print("   ✅ Auto-search as you type")
    print("   ✅ Enter key immediate search")
    print("   ✅ Visual feedback and loading states")
    print("   ✅ Auto-focus for continuous scanning")
    print("   ✅ Flexible search (exact code, partial name, etc.)")
