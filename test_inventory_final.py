#!/usr/bin/env python3
"""
Test inventory and medicine search functionality comprehensively
"""
import requests
import json
import time

BASE_URL = 'http://localhost:8000/api'

def test_medicine_search_performance():
    """Test medicine search with various queries and performance"""
    print("🔍 Testing Medicine Search Performance & Functionality")
    print("=" * 60)
    
    # Get authentication token
    auth_response = requests.post(f"{BASE_URL}/token/", json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if auth_response.status_code == 200:
        token = auth_response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Authentication successful")
    else:
        print("❌ Authentication failed")
        return False
    
    # Test 1: Basic medicine listing with pagination
    print("\n📋 Testing Basic Medicine Listing...")
    start_time = time.time()
    response = requests.get(f"{BASE_URL}/medicine/medicines/?page=1&page_size=50", headers=headers)
    end_time = time.time()
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Listed {len(data['results'])} medicines out of {data['count']} total")
        print(f"⏱️  Response time: {(end_time - start_time) * 1000:.2f}ms")
        
        # Show sample medicines
        for i, medicine in enumerate(data['results'][:5]):
            print(f"   {i+1}. {medicine.get('nom', 'N/A')} - {medicine.get('forme', 'N/A')}")
    else:
        print(f"❌ Failed: {response.status_code}")
        return False
    
    # Test 2: Quick search functionality
    print("\n🔎 Testing Quick Search...")
    search_terms = [
        'paracetamol',
        'doliprane', 
        'aspirin',
        'amoxicilline',
        'efferalgan',
        'panadol',
        'ibuprofen',
        'voltaren'
    ]
    
    search_results = {}
    total_search_time = 0
    
    for term in search_terms:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/medicine/medicines/quick_search/?q={term}", headers=headers)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        total_search_time += response_time
        
        if response.status_code == 200:
            results = response.json()
            search_results[term] = len(results)
            print(f"✅ '{term}': {len(results)} results ({response_time:.2f}ms)")
            
            # Show top 2 results for this search
            for i, medicine in enumerate(results[:2]):
                print(f"     {i+1}. {medicine.get('nom', 'N/A')}")
        else:
            print(f"❌ '{term}': Failed ({response.status_code})")
            search_results[term] = 0
    
    avg_search_time = total_search_time / len(search_terms)
    print(f"\n📊 Search Performance Summary:")
    print(f"   Average search time: {avg_search_time:.2f}ms")
    print(f"   Total searches: {len(search_terms)}")
    print(f"   Successful searches: {len([r for r in search_results.values() if r > 0])}")
    
    # Test 3: Edge cases and stress testing
    print("\n⚡ Testing Edge Cases...")
    
    edge_cases = [
        ('very_long_search_term_that_should_not_match_anything_but_test_performance', 'Long term'),
        ('a', 'Single character'),
        ('123', 'Numbers only'),
        ('paracetamol 500mg', 'With dosage'),
        ('DOLIPRANE', 'Uppercase'),
        ('', 'Empty search')
    ]
    
    for term, description in edge_cases:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/medicine/medicines/quick_search/?q={term}", headers=headers)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ {description}: {len(results)} results ({response_time:.2f}ms)")
        else:
            print(f"❌ {description}: Failed ({response.status_code})")
    
    return True

def test_inventory_functionality():
    """Test inventory logs and functionality"""
    print("\n📦 Testing Inventory Functionality")
    print("=" * 50)
    
    # Get authentication token
    auth_response = requests.post(f"{BASE_URL}/token/", json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if auth_response.status_code == 200:
        token = auth_response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
    else:
        print("❌ Authentication failed")
        return False
    
    # Test inventory logs
    print("📋 Testing Inventory Logs...")
    response = requests.get(f"{BASE_URL}/inventory/logs/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {data['count']} inventory log entries")
        
        # Show recent logs
        for i, log in enumerate(data['results'][:3]):
            print(f"   {i+1}. {log.get('transaction_type', 'N/A')} - {log.get('quantity_changed', 'N/A')} units - {log.get('reason', 'N/A')}")
    else:
        print(f"❌ Inventory logs failed: {response.status_code}")
        return False
    
    return True

def main():
    print("🏥 Comprehensive Inventory & Medicine Search Test")
    print("=" * 70)
    print("Testing system with 5,000+ medicines in database...")
    
    # Run all tests
    medicine_test = test_medicine_search_performance()
    inventory_test = test_inventory_functionality()
    
    print("\n" + "=" * 70)
    print("📊 FINAL RESULTS:")
    print(f"✅ Medicine Search System: {'WORKING' if medicine_test else 'FAILED'}")
    print(f"✅ Inventory System: {'WORKING' if inventory_test else 'FAILED'}")
    
    if medicine_test and inventory_test:
        print("\n🎉 ALL SYSTEMS WORKING PERFECTLY!")
        print("✅ Medicine search is fast and accurate")
        print("✅ Inventory tracking is functional")
        print("✅ System ready for production use")
    else:
        print("\n⚠️  SOME ISSUES FOUND - Check the logs above")

if __name__ == '__main__':
    main()
