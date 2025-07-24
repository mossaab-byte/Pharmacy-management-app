#!/usr/bin/env python
"""
Quick test to verify ATHYMIL sale works
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from rest_framework.test import APIClient
from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine

def test_athymil_sale():
    """Test selling ATHYMIL"""
    print("🧪 Testing ATHYMIL Sale")
    print("=" * 30)
    
    # Check ATHYMIL inventory
    athymil = Medicine.objects.filter(nom__icontains='ATHYMIL').first()
    if not athymil:
        print("❌ ATHYMIL not found in Medicine table")
        return
    
    pm = PharmacyMedicine.objects.filter(medicine=athymil).first()
    if not pm:
        print("❌ ATHYMIL not found in PharmacyMedicine table")
        return
    
    print(f"✅ ATHYMIL found: ID={athymil.id}, Stock={pm.quantity}")
    
    # Test API call
    client = APIClient()
    sale_data = {
        "customer": None,  # Client de passage
        "items": [{
            "medicine_id": athymil.id,
            "quantity": 1,
            "unit_price": 15.50
        }]
    }
    
    print(f"📤 Testing sale: {sale_data}")
    
    try:
        response = client.post('/api/sales/sales/', sale_data, format='json')
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Sale succeeded!")
            # Check new stock
            pm.refresh_from_db()
            print(f"📦 New stock: {pm.quantity}")
        else:
            print(f"❌ Sale failed: {response.data}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_athymil_sale()
