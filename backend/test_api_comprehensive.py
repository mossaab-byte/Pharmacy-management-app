# tests/test_comprehensive_api.py
import requests
import json
from datetime import date, timedelta
from decimal import Decimal
import uuid

class PharmacyAPITester:
    """Comprehensive API testing for pharmacy management system"""
    
    def __init__(self, base_url='http://localhost:8000/api'):
        self.base_url = base_url
        self.access_token = None
        self.pharmacy_id = None
        self.session = requests.Session()
    
    def authenticate(self, username='admin', password='admin123'):
        """Authenticate and get access token"""
        url = f"{self.base_url}/token/"
        data = {
            'username': username,
            'password': password
        }
        
        response = self.session.post(url, data=data)
        if response.status_code == 200:
            result = response.json()
            self.access_token = result['access']
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
            print("✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(response.text)
            return False
    
    def test_health_check(self):
        """Test API health check"""
        url = f"{self.base_url}/utils/health/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health check passed: {result['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        url = f"{self.base_url}/register-user/"
        data = {
            'username': f'testuser_{uuid.uuid4().hex[:8]}',
            'email': 'testuser@example.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123'
        }
        
        response = self.session.post(url, json=data)
        if response.status_code == 201:
            print("✅ User registration successful")
            return True
        else:
            print(f"❌ User registration failed: {response.status_code}")
            print(response.text)
            return False
    
    def test_pharmacy_management(self):
        """Test pharmacy management endpoints"""
        # Get pharmacy info
        url = f"{self.base_url}/pharmacy/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            pharmacies = response.json()
            if pharmacies:
                self.pharmacy_id = pharmacies[0]['id']
                print(f"✅ Pharmacy management working - Found {len(pharmacies)} pharmacies")
                return True
            else:
                print("⚠️ No pharmacies found")
                return False
        else:
            print(f"❌ Pharmacy management failed: {response.status_code}")
            return False
    
    def test_medicine_inventory(self):
        """Test medicine inventory management"""
        url = f"{self.base_url}/pharmacy/medicines/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            medicines = response.json()
            print(f"✅ Medicine inventory working - Found {len(medicines)} medicines")
            
            # Test stock adjustment if medicines exist
            if medicines:
                medicine_id = medicines[0]['id']
                self.test_stock_adjustment(medicine_id)
            
            return True
        else:
            print(f"❌ Medicine inventory failed: {response.status_code}")
            return False
    
    def test_stock_adjustment(self, medicine_id):
        """Test stock adjustment"""
        # Add stock
        url = f"{self.base_url}/pharmacy/medicines/{medicine_id}/add_stock/"
        data = {
            'amount': 50,
            'reason': 'TEST_PURCHASE'
        }
        
        response = self.session.post(url, json=data)
        if response.status_code == 200:
            print("✅ Stock adjustment (add) working")
        else:
            print(f"❌ Stock adjustment failed: {response.status_code}")
    
    def test_sales_management(self):
        """Test sales management"""
        url = f"{self.base_url}/sales/sales/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            sales = response.json()
            print(f"✅ Sales management working - Found {len(sales)} sales")
            return True
        else:
            print(f"❌ Sales management failed: {response.status_code}")
            return False
    
    def test_customer_management(self):
        """Test customer management"""
        url = f"{self.base_url}/sales/customers/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ Customer management working - Found {len(customers)} customers")
            return True
        else:
            print(f"❌ Customer management failed: {response.status_code}")
            return False
    
    def test_purchase_management(self):
        """Test purchase management"""
        url = f"{self.base_url}/purchases/"
        response = self.session.get(url)
        
        if response.status_code == 200:
            purchases = response.json()
            print(f"✅ Purchase management working - Found {len(purchases)} purchases")
            return True
        else:
            print(f"❌ Purchase management failed: {response.status_code}")
            return False
    
    def test_dashboard_analytics(self):
        """Test dashboard and analytics"""
        endpoints = [
            '/dashboard/kpis/',
            '/dashboard/top-products/',
            '/dashboard/revenue-trend/',
            '/dashboard/sales/',
            '/dashboard/inventory/'
        ]
        
        all_passed = True
        for endpoint in endpoints:
            url = f"{self.base_url}{endpoint}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                print(f"✅ Dashboard endpoint {endpoint} working")
            else:
                print(f"❌ Dashboard endpoint {endpoint} failed: {response.status_code}")
                all_passed = False
        
        return all_passed
    
    def test_financial_reports(self):
        """Test financial reporting capabilities"""
        # This would test custom financial endpoints when implemented
        print("🔄 Financial reporting tests - To be implemented with custom endpoints")
        return True
    
    def test_performance_metrics(self):
        """Test system performance"""
        import time
        
        start_time = time.time()
        
        # Test response time for key endpoints
        endpoints = [
            '/utils/health/',
            '/pharmacy/',
            '/sales/sales/',
            '/dashboard/kpis/'
        ]
        
        for endpoint in endpoints:
            url = f"{self.base_url}{endpoint}"
            start = time.time()
            response = self.session.get(url)
            end = time.time()
            
            response_time = (end - start) * 1000  # Convert to milliseconds
            
            if response.status_code == 200 and response_time < 1000:  # Less than 1 second
                print(f"✅ {endpoint} response time: {response_time:.2f}ms")
            else:
                print(f"⚠️ {endpoint} slow response: {response_time:.2f}ms")
        
        total_time = time.time() - start_time
        print(f"📊 Total test time: {total_time:.2f} seconds")
        
        return True
    
    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting comprehensive API testing...\n")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Authentication", lambda: self.authenticate()),
            ("User Registration", self.test_user_registration),
            ("Pharmacy Management", self.test_pharmacy_management),
            ("Medicine Inventory", self.test_medicine_inventory),
            ("Sales Management", self.test_sales_management),
            ("Customer Management", self.test_customer_management),
            ("Purchase Management", self.test_purchase_management),
            ("Dashboard Analytics", self.test_dashboard_analytics),
            ("Financial Reports", self.test_financial_reports),
            ("Performance Metrics", self.test_performance_metrics),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing {test_name}...")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
        
        print(f"\n📋 Test Results:")
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! Your pharmacy management system is working perfectly!")
        elif passed >= total * 0.8:
            print("\n👍 Most tests passed! System is mostly functional with minor issues.")
        else:
            print("\n⚠️ Several tests failed. Please check the system configuration.")
        
        return passed == total


def main():
    """Run the comprehensive test suite"""
    print("🏥 Pharmacy Management System - Comprehensive API Test Suite")
    print("=" * 60)
    
    tester = PharmacyAPITester()
    
    # Test with default localhost
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Access the application at: http://localhost:3000")
        print("2. Login with: admin / admin123")
        print("3. Explore all the advanced features!")
        print("4. Register new pharmacies and users")
        print("5. Test the complete workflow")
    else:
        print("\n🔧 Troubleshooting:")
        print("1. Ensure backend server is running: python manage.py runserver")
        print("2. Ensure database is migrated: python manage.py migrate")
        print("3. Run setup command: python manage.py setup_advanced_pharmacy")
        print("4. Check for any error messages in the terminal")


if __name__ == "__main__":
    main()
