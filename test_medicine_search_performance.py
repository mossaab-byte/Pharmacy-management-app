#!/usr/bin/env python3
"""
Medicine Search Performance Test
Tests the optimized medicine search performance after fixing the 2-minute loading issue
"""

import requests
import time
import json

def test_medicine_search_performance():
    """Test the optimized medicine search API performance"""
    base_url = "http://127.0.0.1:8000/api/medicine/medicines/quick_search/"
    
    test_queries = [
        ("para", "Short query - should be very fast"),
        ("paracetamol", "Medium query - should be fast"),
        ("a", "Single letter - should handle well"),
        ("123", "Numeric query - should work"),
        ("xyz", "Random query - should respond quickly even with no results")
    ]
    
    print("🔍 MEDICINE SEARCH PERFORMANCE TEST")
    print("=" * 50)
    print("Previously: Medicine search took 2 minutes to load all 5000+ medicines")
    print("After optimization: Using real-time search without bulk loading")
    print()
    
    all_tests_passed = True
    
    for query, description in test_queries:
        print(f"Testing: {description}")
        print(f"Query: '{query}'")
        
        start_time = time.time()
        
        try:
            response = requests.get(base_url, params={'q': query, 'limit': 10}, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                results = response.json()
                result_count = len(results)
                
                print(f"✅ Success: {result_count} results in {response_time:.2f}ms")
                
                if response_time > 1000:  # More than 1 second is too slow
                    print(f"⚠️  WARNING: Response time {response_time:.2f}ms is slower than expected")
                    all_tests_passed = False
                elif response_time < 100:
                    print(f"🚀 EXCELLENT: Very fast response!")
                elif response_time < 500:
                    print(f"✨ GOOD: Fast response!")
                
            else:
                print(f"❌ Failed: HTTP {response.status_code}")
                all_tests_passed = False
                
        except requests.exceptions.Timeout:
            print(f"❌ Failed: Request timed out (>10 seconds)")
            all_tests_passed = False
        except Exception as e:
            print(f"❌ Failed: {str(e)}")
            all_tests_passed = False
            
        print("-" * 30)
        print()
    
    print("📊 PERFORMANCE TEST SUMMARY")
    print("=" * 50)
    
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Medicine search is now optimized and responds quickly")
        print("✅ No more 2-minute loading delays")
        print("✅ Real-time search working properly")
    else:
        print("⚠️  Some tests failed - review performance issues above")
    
    print()
    print("💡 OPTIMIZATION SUMMARY:")
    print("- Removed bulk loading of all 5000+ medicines")
    print("- Implemented real-time search with direct API calls")
    print("- Added query optimization in backend")
    print("- Reduced debounce timing to 150ms")
    print("- Added smart query handling (short vs long queries)")

if __name__ == "__main__":
    test_medicine_search_performance()
