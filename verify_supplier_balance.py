#!/usr/bin/env python3
"""
Supplier Balance Verification Script
Verifies that supplier balances are calculated correctly
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.db.models import Sum
from Purchases.models import Supplier, SupplierTransaction, Purchase

def verify_supplier_balances():
    print("🔍 SUPPLIER BALANCE VERIFICATION")
    print("=" * 50)
    
    suppliers = Supplier.objects.all()
    for supplier in suppliers:
        print(f"\n📊 Supplier: {supplier.name}")
        print(f"💰 Current Balance (stored): {supplier.current_balance} DH")
        
        # Calculate manual balance
        transactions = SupplierTransaction.objects.filter(supplier=supplier)
        total_purchases = transactions.filter(type='purchase').aggregate(total=Sum('amount'))['total'] or 0
        total_payments = transactions.filter(type='payment').aggregate(total=Sum('amount'))['total'] or 0
        calculated_balance = total_purchases - total_payments
        
        print(f"📈 Total Purchases: {total_purchases} DH")
        print(f"📉 Total Payments: {total_payments} DH")
        print(f"🧮 Calculated Balance: {calculated_balance} DH")
        
        # Check if they match
        balance_match = abs(float(supplier.current_balance) - float(calculated_balance)) < 0.01
        print(f"✅ Balance Match: {balance_match}")
        
        if not balance_match:
            print(f"⚠️  MISMATCH! Updating balance...")
            supplier.current_balance = calculated_balance
            supplier.save()
            print(f"✅ Balance updated to: {supplier.current_balance} DH")
        
        # Show recent transactions
        print(f"📋 Recent Transactions:")
        recent_transactions = transactions.order_by('-date')[:5]
        for trans in recent_transactions:
            print(f"   - {trans.date.date()}: {trans.type} {trans.amount} DH (running: {trans.running_balance})")
        
        # Show related purchases
        print(f"🛒 Related Purchases:")
        purchases = Purchase.objects.filter(supplier=supplier).order_by('-created_at')[:3]
        for purchase in purchases:
            print(f"   - {purchase.created_at.date()}: {purchase.total_amount} DH (status: {purchase.status})")
        
        print("-" * 40)

if __name__ == "__main__":
    verify_supplier_balances()
    print("\n🎉 Verification completed!")
