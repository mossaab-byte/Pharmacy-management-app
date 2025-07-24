#!/usr/bin/env python
"""
Direct API test to see exact validation error for ATHYMIL sale
"""
import os
import django
import json
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

def test_athymil_api_call():
    """Test the exact API call that frontend is making"""
    print("🧪 Testing ATHYMIL API Call")
    print("=" * 40)
    
    # Get ATHYMIL ID
    from Medicine.models import Medicine
    athymil = Medicine.objects.filter(nom__icontains='ATHYMIL').first()
    if not athymil:
        print("❌ ATHYMIL not found")
        return
    
    print(f"✅ ATHYMIL ID: {athymil.id}")
    
    # Create test client
    client = Client()
    
    # Exact data that frontend is sending
    sale_data = {
        "customer": None,  # null for "Client de passage"
        "items": [{
            "medicine_id": athymil.id,
            "quantity": 1,
            "unit_price": 15.50
        }]
    }
    
    print(f"📤 Sending data: {json.dumps(sale_data, indent=2)}")
    
    # Make API call
    response = client.post(
        '/api/sales/sales/',
        data=json.dumps(sale_data),
        content_type='application/json'
    )
    
    print(f"📥 Response status: {response.status_code}")
    print(f"📄 Response content: {response.content.decode()}")
    
    if response.status_code != 201:
        print("\n❌ API call failed - let's debug...")
        
        # Parse response
        try:
            response_data = json.loads(response.content.decode())
            print(f"🔍 Parsed response: {json.dumps(response_data, indent=2)}")
        except:
            print("🔍 Could not parse response as JSON")

if __name__ == "__main__":
    test_athymil_api_call()
