#!/usr/bin/env python
"""
Test creating a new sale to verify totals work correctly
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem, Customer
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine
from decimal import Decimal

def test_sale_creation():
    print("🧪 Testing sale creation with correct totals...")
    
    # Get ATHYMIL medicine
    athymil = Medicine.objects.filter(nom__icontains='ATHYMIL').first()
    if not athymil:
        print("❌ ATHYMIL not found")
        return
    
    print(f"✅ Found medicine: {athymil.nom} (Price: {athymil.prix_br})")
    
    # Get or create PharmacyMedicine
    pharmacy = Pharmacy.objects.first()
    if not pharmacy:
        print("❌ No pharmacy found")
        return
    
    pharmacy_medicine, created = PharmacyMedicine.objects.get_or_create(
        medicine=athymil,
        pharmacy=pharmacy,
        defaults={'quantity': 100}  # Ensure we have stock
    )
    
    if created:
        print(f"✅ Created PharmacyMedicine with stock: {pharmacy_medicine.quantity}")
    else:
        print(f"✅ Found PharmacyMedicine with stock: {pharmacy_medicine.quantity}")
        # Ensure we have stock for the test
        if pharmacy_medicine.quantity < 1:
            pharmacy_medicine.quantity = 100
            pharmacy_medicine.save()
    
    # Create a test sale manually
    sale = Sale.objects.create(
        pharmacy=pharmacy,
        customer=None  # Walk-in customer
    )
    
    print(f"✅ Created sale: {sale.reference}")
    print(f"   Initial total: {sale.total_amount}")
    
    # Create sale item
    sale_item = SaleItem.objects.create(
        sale=sale,
        pharmacy_medicine=pharmacy_medicine,
        quantity=1,
        unit_price=Decimal(str(athymil.prix_br))
    )
    
    print(f"✅ Created sale item:")
    print(f"   Medicine: {sale_item.pharmacy_medicine.medicine.nom}")
    print(f"   Quantity: {sale_item.quantity}")
    print(f"   Unit Price: {sale_item.unit_price}")
    print(f"   Subtotal: {sale_item.subtotal}")
    
    # Refresh sale from database
    sale.refresh_from_db()
    print(f"✅ Sale total after item creation: {sale.total_amount}")
    
    # Manually call update_totals to be sure
    sale.update_totals()
    print(f"✅ Sale total after manual update: {sale.total_amount}")
    
    print(f"\n📊 Test completed - Sale {sale.reference} should have total: {sale.total_amount}")

if __name__ == "__main__":
    test_sale_creation()
