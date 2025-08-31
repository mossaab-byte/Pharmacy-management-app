#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from Dashboard.views import KpisView
from Authentification.models import PharmacyUser
from Purchases.models import Purchase, Supplier
from django.contrib.auth import get_user_model
from django.db.models import Sum

def main():
    print("=== BACKEND DATA DIAGNOSTIC ===")
    
    # Get the user
    User = get_user_model()
    user = User.objects.filter(username='marouaneTibary').first()
    
    if not user:
        print("❌ User 'marouaneTibary' not found")
        return
        
    print(f"✅ User found: {user.username}")
    print(f"✅ User pharmacy: {user.pharmacy.name if user.pharmacy else 'None'}")
    
    if not user.pharmacy:
        print("❌ User has no pharmacy associated")
        return
    
    # Check purchases directly
    pharmacy = user.pharmacy
    purchases = Purchase.objects.filter(pharmacy=pharmacy)
    
    print(f"\n=== PURCHASE DATA ===")
    print(f"Total purchases in DB: {purchases.count()}")
    
    if purchases.exists():
        total_amount = purchases.aggregate(total=Sum('total_amount'))['total'] or 0
        print(f"Sum of total_amount: {total_amount} DH")
        
        print("\nIndividual purchases:")
        for p in purchases:
            print(f"  - Purchase {p.id}: {p.total_amount} DH (created: {p.created_at})")
    else:
        print("No purchases found for this pharmacy")
    
    # Check suppliers
    print(f"\n=== SUPPLIER DATA ===")
    suppliers = Supplier.objects.filter(pharmacy=pharmacy)
    print(f"Total suppliers in DB: {suppliers.count()}")
    
    if suppliers.exists():
        for supplier in suppliers:
            print(f"  - Supplier {supplier.name}:")
            print(f"    Credit Limit: {supplier.credit_limit} DH")
            print(f"    Current Balance: {supplier.current_balance} DH")
    else:
        print("No suppliers found for this pharmacy")
    
    # Test KPI endpoint logic
    print(f"\n=== KPI CALCULATION TEST ===")
    try:
        # Simulate the KPI calculation
        total_purchases = Purchase.objects.filter(pharmacy=pharmacy).aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        print(f"KPI totalPurchases calculation: {total_purchases} DH")
        
        if total_purchases == 0:
            print("⚠️ KPI calculation returns 0 - this might be the frontend issue")
        else:
            print("✅ KPI calculation looks correct")
            
    except Exception as e:
        print(f"❌ KPI calculation error: {e}")

if __name__ == "__main__":
    main()
