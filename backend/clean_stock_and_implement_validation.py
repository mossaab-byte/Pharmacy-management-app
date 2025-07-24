#!/usr/bin/env python
"""
Script to clean mock stock data and implement real stock validation
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Pharmacy.models import PharmacyMedicine
from Inventory.models import InventoryLog

def clean_mock_stock_data():
    """Remove all mock stock data and reset to realistic levels"""
    print("=== Cleaning Mock Stock Data ===")
    
    # Get all medicines with stock
    medicines_with_stock = PharmacyMedicine.objects.filter(quantity__gt=0)
    print(f"Found {medicines_with_stock.count()} medicines with stock:")
    
    for pm in medicines_with_stock:
        print(f"- {pm.medicine.nom}: {pm.quantity} units")
    
    # Reset all quantities to 0 (clean slate)
    print("\nResetting all stock quantities to 0...")
    PharmacyMedicine.objects.all().update(quantity=0, units_sold=0)
    
    # Delete all inventory logs (they were for mock data)
    log_count = InventoryLog.objects.count()
    if log_count > 0:
        print(f"Deleting {log_count} inventory logs...")
        InventoryLog.objects.all().delete()
    
    print("✅ Mock stock data cleaned successfully!")
    print("All medicines now have 0 stock - pharmacy owner needs to add real inventory")

def add_sample_realistic_stock():
    """Add a small amount of realistic stock for testing"""
    print("\n=== Adding Sample Realistic Stock ===")
    
    # Get first 3 medicines for testing
    medicines = PharmacyMedicine.objects.all()[:3]
    
    realistic_quantities = [5, 8, 3]  # Small, realistic quantities
    
    for i, pm in enumerate(medicines):
        if i < len(realistic_quantities):
            pm.quantity = realistic_quantities[i]
            pm.save()
            print(f"Added {realistic_quantities[i]} units of {pm.medicine.nom}")
    
    print("✅ Sample realistic stock added!")

if __name__ == "__main__":
    clean_mock_stock_data()
    add_sample_realistic_stock()
    
    print("\n=== Final Stock Status ===")
    current_stock = PharmacyMedicine.objects.filter(quantity__gt=0)
    print(f"Medicines with stock: {current_stock.count()}")
    for pm in current_stock:
        print(f"- {pm.medicine.nom}: {pm.quantity} units")
