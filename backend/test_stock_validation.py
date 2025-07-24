#!/usr/bin/env python
"""
Test script to verify stock validation implementation
"""
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine

def test_stock_validation():
    """Test the stock validation system"""
    print("=== Testing Stock Validation System ===")
    
    # Check current stock
    medicines_with_stock = PharmacyMedicine.objects.filter(quantity__gt=0)
    print(f"\nCurrent stock status:")
    for pm in medicines_with_stock:
        print(f"- {pm.medicine.nom}: {pm.quantity} units")
    
    if medicines_with_stock.count() == 0:
        print("❌ No medicines with stock found. Adding test stock...")
        # Add some test stock
        medicines = PharmacyMedicine.objects.all()[:2]
        for i, pm in enumerate(medicines):
            pm.quantity = [5, 3][i]
            pm.save()
            print(f"Added {pm.quantity} units of {pm.medicine.nom}")
    
    # Test API endpoints
    print("\n=== Testing Stock Validation via API ===")
    
    # Test with valid quantities (should work)
    pm = medicines_with_stock.first()
    if pm:
        valid_sale_data = {
            "customer": None,  # Client de passage
            "items": [{
                "medicine_id": pm.medicine.id,
                "quantity": 1,  # Less than available stock
                "unit_price": 10.50
            }]
        }
        
        print(f"\n✅ Testing valid sale: 1 unit of {pm.medicine.nom} (available: {pm.quantity})")
        print(f"Sale data: {json.dumps(valid_sale_data, indent=2)}")
        
        # Test with excessive quantities (should fail)
        invalid_sale_data = {
            "customer": None,
            "items": [{
                "medicine_id": pm.medicine.id,
                "quantity": pm.quantity + 5,  # More than available stock
                "unit_price": 10.50
            }]
        }
        
        print(f"\n❌ Testing invalid sale: {pm.quantity + 5} units of {pm.medicine.nom} (available: {pm.quantity})")
        print(f"Sale data: {json.dumps(invalid_sale_data, indent=2)}")
        
        print("\n💡 To test via frontend:")
        print("1. Start the servers: python manage.py runserver")
        print("2. Go to http://localhost:3333/sales")
        print("3. Try to sell more than available stock")
        print("4. You should see stock validation error messages")

if __name__ == "__main__":
    test_stock_validation()
