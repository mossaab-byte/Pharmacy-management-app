#!/usr/bin/env python
"""
Test script to verify that expiry_date and batch_number fields have been successfully removed
from the PurchaseItem model and related components.
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

from django.contrib.auth import get_user_model
from Purchases.models import Purchase, PurchaseItem, Supplier
from Medicine.models import Medicine
from Pharmacy.models import Pharmacy
from Purchases.serializers import PurchaseItemSerializer

User = get_user_model()

def test_model_fields():
    """Test that the fields have been removed from the model"""
    print("🔍 Testing PurchaseItem model fields...")
    
    # Get model fields
    purchase_item_fields = [field.name for field in PurchaseItem._meta.fields]
    print(f"📋 Current PurchaseItem fields: {purchase_item_fields}")
    
    # Check that obsolete fields are removed
    if 'expiry_date' not in purchase_item_fields:
        print("✅ expiry_date field successfully removed from model")
    else:
        print("❌ expiry_date field still exists in model")
    
    if 'batch_number' not in purchase_item_fields:
        print("✅ batch_number field successfully removed from model")
    else:
        print("❌ batch_number field still exists in model")

def test_serializer_fields():
    """Test that the fields have been removed from the serializer"""
    print("\n🔍 Testing PurchaseItemSerializer fields...")
    
    # Check serializer fields
    serializer_fields = PurchaseItemSerializer.Meta.fields
    print(f"📋 Current PurchaseItemSerializer fields: {serializer_fields}")
    
    if 'expiry_date' not in serializer_fields:
        print("✅ expiry_date field successfully removed from serializer")
    else:
        print("❌ expiry_date field still exists in serializer")
    
    if 'batch_number' not in serializer_fields:
        print("✅ batch_number field successfully removed from serializer")
    else:
        print("❌ batch_number field still exists in serializer")

def test_api_response():
    """Test that API responses don't include the removed fields"""
    print("\n🔍 Testing API response structure...")
    
    try:
        # Test the purchases API endpoint
        response = requests.get('http://localhost:8000/api/purchases/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                # Check first purchase
                first_purchase = data['results'][0]
                if 'items' in first_purchase and len(first_purchase['items']) > 0:
                    first_item = first_purchase['items'][0]
                    print(f"📋 Sample purchase item fields: {list(first_item.keys())}")
                    
                    if 'expiry_date' not in first_item:
                        print("✅ expiry_date field successfully removed from API response")
                    else:
                        print("❌ expiry_date field still exists in API response")
                    
                    if 'batch_number' not in first_item:
                        print("✅ batch_number field successfully removed from API response")
                    else:
                        print("❌ batch_number field still exists in API response")
                else:
                    print("ℹ️ No purchase items found to test API response")
            else:
                print("ℹ️ No purchases found to test API response")
        else:
            print(f"⚠️ API request failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("⚠️ Could not connect to API server - make sure Django server is running")
    except Exception as e:
        print(f"⚠️ Error testing API: {e}")

def create_test_purchase():
    """Create a test purchase to verify model works without obsolete fields"""
    print("\n🔍 Testing purchase creation without obsolete fields...")
    
    try:
        # Get or create test data
        user = User.objects.filter(username='admin').first()
        if not user:
            user = User.objects.create_user('admin', 'admin@test.com', 'admin123')
        
        pharmacy = Pharmacy.objects.filter(pharmacist=user).first()
        if not pharmacy:
            pharmacy = Pharmacy.objects.create(
                name='Test Pharmacy',
                address='Test Address',
                phone='123456789',
                pharmacist=user
            )
        
        supplier = Supplier.objects.filter(pharmacy=pharmacy).first()
        if not supplier:
            supplier = Supplier.objects.create(
                name='Test Supplier',
                pharmacy=pharmacy
            )
        
        medicine = Medicine.objects.first()
        if not medicine:
            print("⚠️ No medicines found in database - cannot create test purchase")
            return
        
        # Create purchase
        purchase = Purchase.objects.create(
            pharmacy=pharmacy,
            supplier=supplier,
            total_amount=100.00,
            received_by=user
        )
        
        # Create purchase item (without expiry_date and batch_number)
        purchase_item = PurchaseItem.objects.create(
            purchase=purchase,
            medicine=medicine,
            quantity=10,
            unit_cost=10.00
        )
        
        print(f"✅ Successfully created purchase {purchase.id} with item {purchase_item.id}")
        print(f"📋 Purchase item fields: quantity={purchase_item.quantity}, unit_cost={purchase_item.unit_cost}, subtotal={purchase_item.subtotal}")
        
        # Clean up
        purchase.delete()
        print("✅ Test purchase cleaned up successfully")
        
    except Exception as e:
        print(f"❌ Error creating test purchase: {e}")

if __name__ == "__main__":
    print("🧪 Testing Expiry Date and Batch Number Field Removal")
    print("=" * 60)
    
    test_model_fields()
    test_serializer_fields()
    test_api_response()
    create_test_purchase()
    
    print("\n🎉 Test completed!")
