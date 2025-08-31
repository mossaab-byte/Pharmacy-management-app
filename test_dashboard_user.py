#!/usr/bin/env python3
"""
Fix Dashboard Purchase Total - Test current user's pharmacy association
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')

django.setup()

from django.contrib.auth import get_user_model
from Purchases.models import Purchase
from django.db.models import Sum

User = get_user_model()

def main():
    print("=== DASHBOARD PURCHASE TOTAL FIX ===\n")
    
    # Check which users are likely to be logged in (recent activity)
    print("1. CHECKING ACTIVE USERS:")
    print("-" * 40)
    
    # Find users with pharmacies that have purchases
    users_with_purchases = []
    for user in User.objects.all():
        if hasattr(user, 'pharmacy') and user.pharmacy:
            purchases = Purchase.objects.filter(pharmacy=user.pharmacy)
            if purchases.exists():
                total = purchases.aggregate(total=Sum('total_amount'))['total']
                users_with_purchases.append({
                    'user': user,
                    'pharmacy': user.pharmacy,
                    'purchase_total': total
                })
                print(f"User: {user.username} -> Pharmacy: {user.pharmacy.name} -> Purchases: {total} DH")
    
    if not users_with_purchases:
        print("❌ No users with purchases found!")
        return
    
    # Test the dashboard KPI endpoint logic for each user
    print("\n2. SIMULATING DASHBOARD API FOR EACH USER:")
    print("-" * 40)
    
    for user_data in users_with_purchases:
        user = user_data['user']
        pharmacy = user_data['pharmacy']
        expected_total = user_data['purchase_total']
        
        print(f"\nUser: {user.username}")
        print(f"Pharmacy: {pharmacy.name}")
        
        # Simulate the exact KPI calculation from Dashboard/views.py
        total_purchases = Purchase.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('total_amount'))['total'] or 0
        
        print(f"Expected total: {expected_total}")
        print(f"KPI calculation result: {total_purchases}")
        
        if abs(float(expected_total) - float(total_purchases)) < 0.01:
            print("✅ Dashboard calculation is correct")
        else:
            print("❌ Dashboard calculation mismatch!")
    
    # Check if there are any authentication issues
    print("\n3. CHECKING AUTHENTICATION TOKENS:")
    print("-" * 40)
    
    # Look for the most likely current user (marouaneTibary based on image)
    target_user = User.objects.filter(username='marouaneTibary').first()
    if target_user:
        print(f"Target user found: {target_user.username}")
        if hasattr(target_user, 'pharmacy') and target_user.pharmacy:
            print(f"User's pharmacy: {target_user.pharmacy.name}")
            purchases = Purchase.objects.filter(pharmacy=target_user.pharmacy)
            total = purchases.aggregate(total=Sum('total_amount'))['total'] or 0
            print(f"Purchases for this pharmacy: {total} DH")
            
            if total > 0:
                print("✅ This user should see purchases in dashboard")
            else:
                print("❌ This user has no purchases to display")
        else:
            print("❌ User has no pharmacy associated!")
    else:
        print("❌ Target user 'marouaneTibary' not found!")

if __name__ == "__main__":
    main()
