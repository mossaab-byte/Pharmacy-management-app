#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

def test_customer_api():
    """Test customer creation API"""
    
    # Test data
    customer_data = {
        "first_name": "Test",
        "last_name": "Customer", 
        "email": "test@example.com",
        "phone": "0123456789",
        "address": "Test Address",
        "credit_limit": 200.00,
        "notes": "Test customer"
    }
    
    print("🧪 Testing Customer API...")
    print(f"📤 Sending data: {json.dumps(customer_data, indent=2)}")
    
    try:
        # First test if we can import the serializer
        from Sales.serializers import CustomerSerializer
        print("✅ CustomerSerializer imported successfully")
        
        # Test serializer directly
        serializer = CustomerSerializer(data=customer_data)
        print(f"🔍 Serializer validation: {serializer.is_valid()}")
        
        if not serializer.is_valid():
            print(f"❌ Serializer errors: {serializer.errors}")
            return
        
        print("✅ Serializer validation passed")
        
        # Try to create customer
        customer = serializer.save()
        print(f"✅ Customer created successfully: {customer}")
        print(f"   ID: {customer.id}")
        print(f"   User: {customer.user}")
        print(f"   Phone: {customer.phone}")
        
        return customer
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    test_customer_api()
