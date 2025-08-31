#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('C:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Supplier, SupplierTransaction, Purchase
from Pharmacy.models import Pharmacy

def fix_supplier_pharmacy_assignments():
    """
    Assign suppliers to pharmacies based on their transaction history
    """
    print("🔍 Starting supplier pharmacy assignment fix...")
    
    # Get all suppliers
    suppliers = Supplier.objects.all()
    print(f"📊 Found {suppliers.count()} suppliers to process")
    
    fixed_count = 0
    
    for supplier in suppliers:
        print(f"\n🔍 Processing supplier: {supplier.name}")
        
        # Find which pharmacy this supplier belongs to based on transactions
        transactions = SupplierTransaction.objects.filter(supplier=supplier)
        purchases = Purchase.objects.filter(supplier=supplier)
        
        pharmacy = None
        
        # Check transactions first
        if transactions.exists():
            pharmacy = transactions.first().pharmacy
            print(f"  📋 Found pharmacy from transaction: {pharmacy.name}")
        
        # Check purchases if no transaction pharmacy found
        elif purchases.exists():
            pharmacy = purchases.first().pharmacy
            print(f"  🛒 Found pharmacy from purchase: {pharmacy.name}")
        
        if pharmacy:
            # Update supplier model (even though field doesn't exist in DB yet)
            # This will help when we do the proper migration
            print(f"  ✅ Would assign supplier '{supplier.name}' to pharmacy '{pharmacy.name}'")
            
            # For now, let's create a mapping file
            with open('supplier_pharmacy_mapping.txt', 'a') as f:
                f.write(f"{supplier.id},{pharmacy.id},{supplier.name},{pharmacy.name}\n")
            
            fixed_count += 1
        else:
            print(f"  ❌ No pharmacy found for supplier '{supplier.name}'")
    
    print(f"\n✅ Processing complete! {fixed_count} suppliers mapped to pharmacies")
    print("📝 Mapping saved to supplier_pharmacy_mapping.txt")

if __name__ == "__main__":
    fix_supplier_pharmacy_assignments()
