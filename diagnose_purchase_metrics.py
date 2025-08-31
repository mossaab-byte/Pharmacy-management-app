#!/usr/bin/env python3
"""
Dashboard Purchase Metrics Diagnostic Script
This script diagnoses why purchase totals are showing 0 in the dashboard
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')

django.setup()

from django.contrib.auth import get_user_model
from Purchases.models import Purchase, PurchaseItem
from Pharmacy.models import Pharmacy
from django.db.models import Sum

User = get_user_model()

def main():
    print("=== DASHBOARD PURCHASE METRICS DIAGNOSTIC ===\n")
    
    # 1. Check all purchases in the system
    print("1. SYSTEM-WIDE PURCHASE DATA:")
    print("-" * 40)
    
    all_purchases = Purchase.objects.all()
    print(f"Total purchases in system: {all_purchases.count()}")
    
    if all_purchases.exists():
        total_amount_sum = all_purchases.aggregate(total=Sum('total_amount'))['total'] or 0
        print(f"Total amount across all purchases: {total_amount_sum}")
        
        print("\nRecent purchases:")
        for purchase in all_purchases.order_by('-created_at')[:5]:
            print(f"  ID: {purchase.id}")
            print(f"  Pharmacy: {purchase.pharmacy.name if purchase.pharmacy else 'None'}")
            print(f"  Supplier: {purchase.supplier.name if purchase.supplier else 'None'}")
            print(f"  Total Amount: {purchase.total_amount}")
            print(f"  Items count: {purchase.items.count()}")
            print(f"  Created: {purchase.created_at}")
            print()
    else:
        print("❌ No purchases found in the system!")
        return
    
    # 2. Check pharmacy-specific data
    print("2. PHARMACY-SPECIFIC PURCHASE DATA:")
    print("-" * 40)
    
    pharmacies = Pharmacy.objects.all()
    print(f"Total pharmacies: {pharmacies.count()}")
    
    for pharmacy in pharmacies:
        print(f"\nPharmacy: {pharmacy.name} (ID: {pharmacy.id})")
        pharmacy_purchases = Purchase.objects.filter(pharmacy=pharmacy)
        pharmacy_total = pharmacy_purchases.aggregate(total=Sum('total_amount'))['total'] or 0
        print(f"  Purchases count: {pharmacy_purchases.count()}")
        print(f"  Total amount: {pharmacy_total}")
        
        if pharmacy_purchases.exists():
            print("  Recent purchases:")
            for purchase in pharmacy_purchases.order_by('-created_at')[:3]:
                print(f"    - {purchase.supplier.name}: {purchase.total_amount} DH ({purchase.items.count()} items)")
    
    # 3. Check dashboard calculation logic
    print("\n3. DASHBOARD CALCULATION SIMULATION:")
    print("-" * 40)
    
    # Simulate what the dashboard endpoint does
    for pharmacy in pharmacies:
        print(f"\nSimulating dashboard for {pharmacy.name}:")
        
        # This is the exact query from Dashboard/views.py
        total_purchases = Purchase.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('total_amount'))['total'] or 0
        print(f"  Dashboard totalPurchases query result: {total_purchases}")
        
        # Check monthly breakdown
        from django.db.models.functions import TruncMonth
        purchases_monthly = (
            Purchase.objects
            .filter(pharmacy=pharmacy)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('total_amount'))
            .order_by('month')
        )
        
        print(f"  Monthly breakdown:")
        for monthly in purchases_monthly:
            print(f"    {monthly['month'].strftime('%Y-%m')}: {monthly['total']} DH")
        
        if not purchases_monthly:
            print("    ❌ No monthly data found!")
    
    # 4. Check users and their pharmacy associations
    print("\n4. USER-PHARMACY ASSOCIATIONS:")
    print("-" * 40)
    
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    for user in users:
        pharmacy = getattr(user, 'pharmacy', None)
        print(f"User: {user.username} -> Pharmacy: {pharmacy.name if pharmacy else 'None'}")
    
    # 5. Check purchase items for consistency
    print("\n5. PURCHASE ITEMS CONSISTENCY CHECK:")
    print("-" * 40)
    
    all_items = PurchaseItem.objects.all()
    print(f"Total purchase items: {all_items.count()}")
    
    if all_items.exists():
        # Check for items with zero subtotals
        zero_subtotal_items = all_items.filter(subtotal=0)
        print(f"Items with zero subtotal: {zero_subtotal_items.count()}")
        
        if zero_subtotal_items.exists():
            print("Examples of zero subtotal items:")
            for item in zero_subtotal_items[:3]:
                print(f"  - Medicine: {item.medicine.nom if item.medicine else 'None'}")
                print(f"    Quantity: {item.quantity}, Unit Cost: {item.unit_cost}, Subtotal: {item.subtotal}")
                print(f"    Purchase ID: {item.purchase.id}")
        
        # Calculate total across all items
        total_from_items = all_items.aggregate(total=Sum('subtotal'))['total'] or 0
        print(f"Total from all purchase items: {total_from_items}")
        
        # Compare with purchase totals
        total_from_purchases = all_purchases.aggregate(total=Sum('total_amount'))['total'] or 0
        print(f"Total from purchase records: {total_from_purchases}")
        
        if abs(float(total_from_items) - float(total_from_purchases)) > 0.01:
            print("⚠️ INCONSISTENCY: Purchase totals don't match item subtotals!")
        else:
            print("✅ Purchase totals match item subtotals")

if __name__ == "__main__":
    main()
