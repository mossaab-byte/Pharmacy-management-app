"""
Comprehensive test for the real stock validation system
This test will:
1. ✅ Remove all mock/fake stock data (completed)
2. ✅ Add realistic small quantities (completed) 
3. ✅ Implement stock validation in serializers (completed)
4. ✅ Test that sales fail when stock is insufficient
5. ✅ Test that successful sales reduce stock properly
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import json

from Pharmacy.models import PharmacyMedicine, Pharmacy
from Medicine.models import Medicine
from Sales.models import Sale, SaleItem

def test_stock_validation_system():
    """Test complete stock validation system"""
    print("🧪 Testing Real Stock Validation System")
    print("=" * 50)
    
    # 1. Check current stock status
    print("\n📊 Current Stock Status:")
    medicines_with_stock = PharmacyMedicine.objects.filter(quantity__gt=0)
    
    for pm in medicines_with_stock:
        print(f"   • {pm.medicine.nom}: {pm.quantity} units")
    
    if medicines_with_stock.count() == 0:
        print("   ❌ No stock found - please run stock cleanup first")
        return
    
    print(f"   ✅ Found {medicines_with_stock.count()} medicines with stock")
    
    # 2. Test API Client
    client = APIClient()
    
    # Get a medicine with stock for testing
    test_medicine = medicines_with_stock.first()
    original_stock = test_medicine.quantity
    
    print(f"\n🔬 Testing with: {test_medicine.medicine.nom} (Stock: {original_stock})")
    
    # 3. Test VALID sale (should succeed)
    print("\n✅ Test 1: Valid sale (1 unit)")
    valid_sale_data = {
        "customer": None,  # Client de passage
        "items": [{
            "medicine_id": test_medicine.medicine.id,
            "quantity": 1,
            "unit_price": 15.00
        }]
    }
    
    try:
        response = client.post('/api/sales/sales/', valid_sale_data, format='json')
        if response.status_code == 201:
            print("   ✅ Valid sale succeeded")
            # Check if stock was reduced
            test_medicine.refresh_from_db()
            new_stock = test_medicine.quantity
            print(f"   📦 Stock reduced from {original_stock} to {new_stock}")
            
            if new_stock == original_stock - 1:
                print("   ✅ Stock reduction correct")
            else:
                print("   ❌ Stock reduction incorrect")
        else:
            print(f"   ❌ Valid sale failed: {response.status_code}")
            print(f"   Error: {response.data}")
    except Exception as e:
        print(f"   ❌ Valid sale error: {str(e)}")
    
    # 4. Test INVALID sale (should fail with stock error)
    print("\n❌ Test 2: Invalid sale (excessive quantity)")
    current_stock = test_medicine.quantity
    excessive_quantity = current_stock + 10
    
    invalid_sale_data = {
        "customer": None,
        "items": [{
            "medicine_id": test_medicine.medicine.id,
            "quantity": excessive_quantity,
            "unit_price": 15.00
        }]
    }
    
    try:
        response = client.post('/api/sales/sales/', invalid_sale_data, format='json')
        if response.status_code in [400, 422]:
            print("   ✅ Invalid sale correctly rejected")
            error_data = response.data
            if 'stock_error' in str(error_data):
                print("   ✅ Stock error message present")
                print(f"   📄 Error: {error_data}")
            else:
                print(f"   ⚠️  Error message: {error_data}")
        else:
            print(f"   ❌ Invalid sale should have failed but got: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Invalid sale test error: {str(e)}")
    
    # 5. Test ZERO stock (should fail)
    print("\n🚫 Test 3: Zero stock sale")
    # Find a medicine with zero stock or create one
    zero_stock_medicine = PharmacyMedicine.objects.filter(quantity=0).first()
    if not zero_stock_medicine:
        # Set one medicine to zero stock
        zero_stock_medicine = PharmacyMedicine.objects.exclude(id=test_medicine.id).first()
        if zero_stock_medicine:
            zero_stock_medicine.quantity = 0
            zero_stock_medicine.save()
    
    if zero_stock_medicine:
        zero_stock_sale_data = {
            "customer": None,
            "items": [{
                "medicine_id": zero_stock_medicine.medicine.id,
                "quantity": 1,
                "unit_price": 15.00
            }]
        }
        
        try:
            response = client.post('/api/sales/sales/', zero_stock_sale_data, format='json')
            if response.status_code in [400, 422]:
                print("   ✅ Zero stock sale correctly rejected")
                if 'rupture de stock' in str(response.data).lower():
                    print("   ✅ 'Rupture de stock' message found")
            else:
                print(f"   ❌ Zero stock sale should have failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Zero stock test error: {str(e)}")
    
    # 6. Final stock status
    print(f"\n📊 Final Stock Status:")
    final_medicines = PharmacyMedicine.objects.filter(quantity__gt=0)
    for pm in final_medicines:
        print(f"   • {pm.medicine.nom}: {pm.quantity} units")
    
    print("\n" + "=" * 50)
    print("🎯 Stock Validation System Test Complete!")
    print("\n💡 Next steps:")
    print("   1. Start servers: python manage.py runserver")
    print("   2. Test in frontend at http://localhost:3333/sales")
    print("   3. Try selling more than available stock")
    print("   4. Verify stock error messages appear")

if __name__ == "__main__":
    test_stock_validation_system()
