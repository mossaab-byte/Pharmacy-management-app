#!/usr/bin/env python3
"""
Supplier Credit Balance Diagnostic Script
This script diagnoses why supplier balances are showing 0 instead of correct values
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')

django.setup()

from Purchases.models import Supplier, SupplierTransaction, Purchase
from django.db.models import Sum

def main():
    print("=== SUPPLIER CREDIT BALANCE DIAGNOSTIC ===\n")
    
    # 1. Check all suppliers
    print("1. ALL SUPPLIERS DATA:")
    print("-" * 40)
    
    suppliers = Supplier.objects.all()
    print(f"Total suppliers: {suppliers.count()}")
    
    for supplier in suppliers:
        print(f"\nSupplier: {supplier.name}")
        print(f"  ID: {supplier.id}")
        print(f"  Credit Limit: {supplier.credit_limit}")
        print(f"  Current Balance: {supplier.current_balance}")
        print(f"  Payment Terms: {supplier.payment_terms}")
    
    # 2. Check supplier transactions
    print("\n2. SUPPLIER TRANSACTIONS:")
    print("-" * 40)
    
    transactions = SupplierTransaction.objects.all()
    print(f"Total supplier transactions: {transactions.count()}")
    
    if transactions.exists():
        print("\nAll transactions:")
        for tx in transactions.order_by('date'):
            print(f"  {tx.date} - {tx.supplier.name}: {tx.type} {tx.amount} DH (Balance: {tx.running_balance})")
    else:
        print("❌ No supplier transactions found!")
    
    # 3. Check purchases linked to suppliers
    print("\n3. PURCHASES BY SUPPLIER:")
    print("-" * 40)
    
    for supplier in suppliers:
        purchases = Purchase.objects.filter(supplier=supplier)
        total_purchases = purchases.aggregate(total=Sum('total_amount'))['total'] or 0
        
        print(f"\nSupplier: {supplier.name}")
        print(f"  Purchases count: {purchases.count()}")
        print(f"  Total purchase amount: {total_purchases}")
        
        if purchases.exists():
            print("  Recent purchases:")
            for purchase in purchases.order_by('-created_at')[:3]:
                print(f"    - {purchase.created_at.date()}: {purchase.total_amount} DH")
    
    # 4. Calculate expected balance manually
    print("\n4. MANUAL BALANCE CALCULATION:")
    print("-" * 40)
    
    for supplier in suppliers:
        print(f"\nSupplier: {supplier.name}")
        
        # Get all transactions for this supplier
        transactions = SupplierTransaction.objects.filter(supplier=supplier).order_by('date', 'id')
        
        calculated_balance = 0
        print("  Transaction history:")
        for tx in transactions:
            if tx.type == 'purchase':
                calculated_balance += float(tx.amount)
                print(f"    + {tx.amount} (purchase) = {calculated_balance}")
            elif tx.type == 'payment':
                calculated_balance -= float(tx.amount)
                print(f"    - {tx.amount} (payment) = {calculated_balance}")
            elif tx.type == 'reset':
                calculated_balance = float(tx.amount)
                print(f"    = {tx.amount} (reset) = {calculated_balance}")
        
        print(f"  Calculated balance: {calculated_balance}")
        print(f"  Stored balance: {supplier.current_balance}")
        
        if abs(calculated_balance - float(supplier.current_balance)) > 0.01:
            print("  ⚠️ INCONSISTENCY: Calculated balance doesn't match stored balance!")
        else:
            print("  ✅ Balance is correct")
    
    # 5. Check serializer output
    print("\n5. SERIALIZER OUTPUT SIMULATION:")
    print("-" * 40)
    
    from Purchases.serializers import SupplierSerializer
    
    for supplier in suppliers:
        serializer = SupplierSerializer(supplier)
        data = serializer.data
        
        print(f"\nSupplier: {supplier.name}")
        print(f"  Serialized credit_limit: {data.get('credit_limit')}")
        print(f"  Serialized current_balance: {data.get('current_balance')}")
        print(f"  Raw model credit_limit: {supplier.credit_limit}")
        print(f"  Raw model current_balance: {supplier.current_balance}")
    
    # 6. Test the balance update method
    print("\n6. TESTING BALANCE UPDATE METHOD:")
    print("-" * 40)
    
    for supplier in suppliers:
        print(f"\nTesting update_balance() for: {supplier.name}")
        old_balance = supplier.current_balance
        print(f"  Balance before update: {old_balance}")
        
        # Call the update method
        supplier.update_balance()
        supplier.refresh_from_db()
        
        print(f"  Balance after update: {supplier.current_balance}")
        
        if old_balance != supplier.current_balance:
            print(f"  ⚠️ Balance changed from {old_balance} to {supplier.current_balance}")
        else:
            print("  ✅ Balance remained the same")

if __name__ == "__main__":
    main()
