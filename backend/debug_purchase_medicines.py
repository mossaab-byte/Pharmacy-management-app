#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('C:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Purchase, PurchaseItem
from Medicine.models import Medicine

def debug_purchase_medicines():
    """Debug medicine information in purchases"""
    
    print("🔍 Debugging purchase medicine information...")
    
    # Get the specific purchase from the screenshot
    purchase_id = "d1d52e2b-cc42-4911-994e-3e190cc84a7a"  # The current purchase showing Unknown Medicine
    
    try:
        purchase = Purchase.objects.get(id=purchase_id)
        print(f"\n📦 Purchase: {purchase.id}")
        print(f"    Supplier: {purchase.supplier.name}")
        print(f"    Total: {purchase.total_amount}")
        print(f"    Date: {purchase.created_at}")
        
        items = purchase.items.all()
        print(f"\n📋 Purchase Items ({items.count()}):")
        
        for item in items:
            print(f"\n  🏷️ Item ID: {item.id}")
            print(f"     Medicine ID: {item.medicine.id if item.medicine else 'None'}")
            print(f"     Medicine object: {item.medicine if item.medicine else 'None'}")
            
            if item.medicine:
                print(f"     Medicine nom: '{item.medicine.nom}'")
                print(f"     Medicine code: '{item.medicine.code}'")
                print(f"     Medicine dci1: '{item.medicine.dci1}'")
                print(f"     Medicine forme: '{item.medicine.forme}'")
                print(f"     Medicine presentation: '{item.medicine.presentation}'")
            else:
                print(f"     ❌ No medicine associated!")
                
            print(f"     Quantity: {item.quantity}")
            print(f"     Unit Cost: {item.unit_cost}")
            print(f"     Subtotal: {item.subtotal}")
    
    except Purchase.DoesNotExist:
        print(f"❌ Purchase {purchase_id} not found!")
        
        # Let's check what purchases exist
        purchases = Purchase.objects.all().order_by('-created_at')[:5]
        print(f"\n📋 Recent purchases:")
        for p in purchases:
            print(f"  {p.id} - {p.supplier.name} - {p.total_amount} DH")
    
    # Check if there are any medicines in the database
    print(f"\n💊 Total medicines in database: {Medicine.objects.count()}")
    
    medicines = Medicine.objects.all()[:10]
    print(f"\n🔍 Sample medicines:")
    for med in medicines:
        print(f"  {med.id} - '{med.nom}' (code: '{med.code}')")

if __name__ == "__main__":
    debug_purchase_medicines()
