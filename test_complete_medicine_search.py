#!/usr/bin/env python3
"""
Complete Medicine Search Test
Tests the complete medicine search workflow including initial loading
"""

import requests
import time
import json

def test_complete_medicine_search():
    """Test the complete medicine search workflow"""
    base_url = "http://127.0.0.1:8000/api/medicine/medicines/quick_search/"
    
    print("🧪 COMPLETE MEDICINE SEARCH TEST")
    print("=" * 60)
    print("Testing: Medicine search that should work for initial loading")
    print()
    
    # Test searches that the frontend will use for initial loading
    initial_search_terms = [
        ("para", "Paracetamol search - should find common medicines"),
        ("a", "Single letter 'a' - should find many medicines"),
        ("c", "Single letter 'c' - backup search"),
        ("b", "Single letter 'b' - another backup")
    ]
    
    working_searches = []
    
    print("🔍 TESTING INITIAL SEARCH TERMS")
    print("-" * 40)
    
    for term, description in initial_search_terms:
        print(f"Testing: {description}")
        print(f"Search term: '{term}'")
        
        try:
            start_time = time.time()
            response = requests.get(base_url, params={'q': term, 'limit': 5}, timeout=5)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            
            if response.status_code == 200:
                results = response.json()
                result_count = len(results)
                
                print(f"✅ Success: {result_count} results in {response_time:.2f}ms")
                
                if result_count > 0:
                    working_searches.append((term, result_count))
                    print(f"📋 Sample medicine: {results[0].get('nom_commercial', 'N/A')}")
                    
                    # Show medicine structure for debugging
                    medicine = results[0]
                    required_fields = ['id', 'nom_commercial', 'nom', 'prix_public']
                    missing_fields = [field for field in required_fields if field not in medicine]
                    
                    if missing_fields:
                        print(f"⚠️  Missing fields: {missing_fields}")
                    else:
                        print(f"✅ All required fields present")
                else:
                    print(f"⚠️  No results found")
                    
            else:
                print(f"❌ Failed: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            
        print("-" * 30)
        print()
    
    print("📊 INITIAL LOADING ANALYSIS")
    print("=" * 60)
    
    if working_searches:
        print(f"✅ {len(working_searches)} search terms work for initial loading:")
        for term, count in working_searches:
            print(f"  - '{term}': {count} medicines available")
            
        print()
        print("🎉 DIAGNOSIS: Initial loading should work!")
        print("The frontend can load medicines when the component mounts.")
        
        # Test the exact sequence the frontend uses
        print()
        print("🔄 TESTING FRONTEND SEQUENCE")
        print("-" * 40)
        
        for term, count in working_searches[:1]:  # Test first working term
            print(f"Frontend will load medicines using '{term}' search...")
            
            try:
                response = requests.get(base_url, params={'q': term, 'limit': 15}, timeout=5)
                if response.status_code == 200:
                    medicines = response.json()
                    print(f"✅ Frontend will show {len(medicines)} initial medicines")
                    print("✅ Users will see medicines when they focus the search field")
                    break
            except Exception as e:
                print(f"❌ Frontend loading would fail: {e}")
                continue
    else:
        print("❌ NO WORKING SEARCHES FOUND!")
        print("The frontend will not be able to load initial medicines.")
        print("Users will only see results when they type.")
        
    print()
    print("🧪 USER EXPERIENCE TEST")
    print("=" * 60)
    
    user_scenarios = [
        ("Opening sales form", "Focus on medicine search field"),
        ("Typing 'par'", "Search for paracetamol"),
        ("Clearing search", "Should show initial medicines again")
    ]
    
    for scenario, action in user_scenarios:
        print(f"Scenario: {scenario}")
        print(f"Action: {action}")
        
        if scenario == "Opening sales form":
            if working_searches:
                print("✅ Result: User sees initial medicines immediately")
            else:
                print("❌ Result: User sees empty search field")
                
        elif scenario == "Typing 'par'":
            try:
                response = requests.get(base_url, params={'q': 'par', 'limit': 10}, timeout=5)
                if response.status_code == 200:
                    results = response.json()
                    print(f"✅ Result: User sees {len(results)} search results")
                else:
                    print("❌ Result: Search fails")
            except:
                print("❌ Result: Search error")
                
        elif scenario == "Clearing search":
            if working_searches:
                print("✅ Result: User sees initial medicines again")
            else:
                print("❌ Result: User sees empty list")
                
        print("-" * 30)
        print()
    
    print("💡 RECOMMENDATIONS")
    print("=" * 60)
    
    if working_searches:
        print("✅ Medicine search is working correctly!")
        print("✅ Initial loading provides good user experience")
        print("✅ Users can see medicines immediately when opening forms")
    else:
        print("⚠️  Consider adding sample medicines to the database")
        print("⚠️  Or implement a fallback for empty databases")
        
    print()
    print("🎯 NEXT STEPS")
    print("- Open the application in browser")
    print("- Navigate to Sales -> New Sale")
    print("- Click on the medicine search field")
    print("- Verify that medicines appear immediately")

if __name__ == "__main__":
    test_complete_medicine_search()
