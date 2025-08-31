#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

import requests
import json
from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy
from Purchases.models import Supplier, SupplierTransaction

def test_supplier_transactions_api():
    print("🔍 TESTING SUPPLIER TRANSACTIONS API")
    print("=" * 50)
    
    # Get test data from database
    User = get_user_model()
    
    try:
        # Get a test user and pharmacy
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            print("❌ No superuser found")
            return
            
        pharmacy = Pharmacy.objects.first()
        if not pharmacy:
            print("❌ No pharmacy found")
            return
            
        print(f"📋 Testing with user: {user.username}")
        print(f"🏥 Testing with pharmacy: {pharmacy.name}")
        
        # Get suppliers
        suppliers = Supplier.objects.filter(pharmacy=pharmacy)
        if not suppliers.exists():
            print("❌ No suppliers found")
            return
            
        supplier = suppliers.first()
        print(f"🏢 Testing with supplier: {supplier.name} (ID: {supplier.id})")
        
        # Check direct database query
        transactions = SupplierTransaction.objects.filter(
            supplier=supplier,
            pharmacy=pharmacy
        ).order_by('-date')
        
        print(f"\n📊 Direct Database Query Results:")
        print(f"Found {transactions.count()} transactions")
        
        for i, trans in enumerate(transactions[:5]):  # Show first 5
            print(f"  {i+1}. {trans.date} | {trans.type} | {trans.amount} DH | Balance: {trans.running_balance} DH")
            print(f"     Reference: {trans.reference}")
            print(f"     Created by: {trans.created_by}")
            print(f"     Raw amount type: {type(trans.amount)} = {trans.amount}")
            print(f"     Raw running_balance type: {type(trans.running_balance)} = {trans.running_balance}")
            print()
        
        # Test API endpoint (simulate frontend call)
        print(f"\n🌐 Testing API Endpoint:")
        print(f"URL: http://127.0.0.1:8000/purchases/suppliers/{supplier.id}/transactions/")
        
        # We need to use Django's test client instead of requests for internal testing
        from django.test import Client
        from django.contrib.auth.models import AnonymousUser
        
        client = Client()
        
        # Login the user first
        login_response = client.post('/auth/login/', {
            'username': user.username,
            'password': 'testpass123'  # You may need to set this
        })
        
        print(f"Login response status: {login_response.status_code}")
        
        # Make the API call
        response = client.get(f'/purchases/suppliers/{supplier.id}/transactions/')
        print(f"API response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"API returned {len(data)} transactions")
            
            if data:
                print(f"\n📋 First transaction sample:")
                first_trans = data[0]
                for key, value in first_trans.items():
                    print(f"  {key}: {value} (type: {type(value)})")
                    
                print(f"\n🔍 Checking for problematic values:")
                for i, trans in enumerate(data):
                    issues = []
                    if trans.get('amount') in [None, 0, '0', '0.00']:
                        issues.append(f"amount is {trans.get('amount')}")
                    if trans.get('running_balance') in [None, 0, '0', '0.00']:
                        issues.append(f"running_balance is {trans.get('running_balance')}")
                    if not trans.get('reference'):
                        issues.append("reference is empty")
                    
                    if issues:
                        print(f"  Transaction {i+1}: {', '.join(issues)}")
                        print(f"    Full data: {trans}")
            else:
                print("❌ No transaction data returned from API")
        else:
            print(f"❌ API call failed: {response.content}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_supplier_transactions_api()
