#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Supplier, Purchase, SupplierTransaction, PurchaseItem
from Pharmacy.models import Pharmacy
from Authentification.models import PharmacyUser

def diagnose_supplier_credit_issues():
    """Diagnose and fix supplier credit/balance issues"""
    print("🔍 Diagnosing Supplier Credit Issues...")
    print("=" * 60)
    
    # Check if we have suppliers
    suppliers = Supplier.objects.all()
    print(f"📊 Total Suppliers: {suppliers.count()}")
    
    if suppliers.count() == 0:
        print("⚠️  No suppliers found. Creating sample suppliers...")
        create_sample_suppliers()
        suppliers = Supplier.objects.all()
    
    # Check each supplier
    for supplier in suppliers:
        print(f"\n🏢 Supplier: {supplier.name}")
        print(f"   💰 Credit Limit: {supplier.credit_limit}")
        print(f"   💳 Current Balance: {supplier.current_balance}")
        
        # Check transactions
        transactions = supplier.transactions.all().order_by('date')
        print(f"   📋 Transactions: {transactions.count()}")
        
        for tx in transactions:
            print(f"      - {tx.type}: {tx.amount} (Balance: {tx.running_balance})")
        
        # Check purchases
        purchases = Purchase.objects.filter(supplier=supplier)
        print(f"   🛒 Purchases: {purchases.count()}")
        
        total_purchase_amount = sum(p.total_amount for p in purchases)
        print(f"   💵 Total Purchase Amount: {total_purchase_amount}")
        
        # Recalculate balance
        print(f"   🔄 Recalculating balance...")
        supplier.update_balance()
        supplier.refresh_from_db()
        print(f"   ✅ Updated Balance: {supplier.current_balance}")

def create_sample_suppliers():
    """Create sample suppliers with proper credit limits"""
    print("🏗️  Creating sample suppliers...")
    
    suppliers_data = [
        {
            'name': 'MedSupply Corp',
            'contact_person': 'Ahmed Benali',
            'contact_email': 'ahmed@medsupply.ma',
            'contact_phone': '+212-5-22-33-44-55',
            'address': '123 Medical District, Casablanca',
            'credit_limit': 50000.00,
            'payment_terms': 'Net 30 days',
            'delivery_schedule': 'Weekly',
            'minimum_order': 1000.00,
            'discount_rate': 5.00
        },
        {
            'name': 'PharmaDistribution SA',
            'contact_person': 'Fatima Zahir',
            'contact_email': 'fatima@pharmadist.ma',
            'contact_phone': '+212-5-37-88-99-00',
            'address': '456 Pharmacy Ave, Rabat',
            'credit_limit': 75000.00,
            'payment_terms': 'Net 45 days',
            'delivery_schedule': 'Bi-weekly',
            'minimum_order': 2000.00,
            'discount_rate': 7.50
        },
        {
            'name': 'Atlantic Medical Supplies',
            'contact_person': 'Omar Rifai',
            'contact_email': 'omar@atlantic-medical.ma',
            'contact_phone': '+212-5-28-11-22-33',
            'address': '789 Healthcare Blvd, Kenitra',
            'credit_limit': 30000.00,
            'payment_terms': 'Net 15 days',
            'delivery_schedule': 'Monthly',
            'minimum_order': 500.00,
            'discount_rate': 3.00
        }
    ]
    
    for supplier_data in suppliers_data:
        supplier, created = Supplier.objects.get_or_create(
            name=supplier_data['name'],
            defaults=supplier_data
        )
        if created:
            print(f"   ✅ Created: {supplier.name} (Credit: {supplier.credit_limit})")
        else:
            # Update existing supplier with credit limit if it's 0
            if supplier.credit_limit == 0:
                supplier.credit_limit = supplier_data['credit_limit']
                supplier.payment_terms = supplier_data['payment_terms']
                supplier.delivery_schedule = supplier_data['delivery_schedule']
                supplier.minimum_order = supplier_data['minimum_order']
                supplier.discount_rate = supplier_data['discount_rate']
                supplier.save()
                print(f"   🔄 Updated: {supplier.name} (Credit: {supplier.credit_limit})")
            else:
                print(f"   ✅ Exists: {supplier.name} (Credit: {supplier.credit_limit})")

def fix_existing_purchases():
    """Fix existing purchases that might not have created supplier transactions"""
    print("\n🔧 Fixing existing purchases...")
    
    purchases = Purchase.objects.all()
    print(f"📊 Total Purchases: {purchases.count()}")
    
    for purchase in purchases:
        # Check if this purchase has a corresponding supplier transaction
        existing_tx = SupplierTransaction.objects.filter(
            supplier=purchase.supplier,
            type='purchase',
            reference=str(purchase.id)
        ).first()
        
        if not existing_tx and purchase.total_amount > 0:
            print(f"   🔧 Creating missing transaction for Purchase {purchase.id}")
            SupplierTransaction.objects.create(
                supplier=purchase.supplier,
                pharmacy=purchase.pharmacy,
                type='purchase',
                amount=purchase.total_amount,
                reference=str(purchase.id),
                created_by=purchase.received_by,
            )
            
            # Update supplier balance
            purchase.supplier.update_balance()
            print(f"      ✅ Transaction created, new balance: {purchase.supplier.current_balance}")

def test_supplier_balance_calculation():
    """Test the supplier balance calculation with sample data"""
    print("\n🧪 Testing supplier balance calculation...")
    
    # Get or create a test pharmacy
    pharmacy = Pharmacy.objects.first()
    if not pharmacy:
        print("⚠️  No pharmacy found for testing")
        return
    
    # Get or create a test user
    user = PharmacyUser.objects.filter(is_pharmacist=True).first()
    if not user:
        print("⚠️  No pharmacist found for testing")
        return
    
    # Get a supplier
    supplier = Supplier.objects.first()
    if not supplier:
        print("⚠️  No supplier found for testing")
        return
    
    print(f"   🏢 Testing with supplier: {supplier.name}")
    print(f"   💰 Initial balance: {supplier.current_balance}")
    
    # Test adding a payment to reduce balance
    print("   💳 Adding test payment...")
    payment_tx = SupplierTransaction.objects.create(
        supplier=supplier,
        pharmacy=pharmacy,
        type='payment',
        amount=1000.00,
        reference='TEST_PAYMENT',
        created_by=user,
    )
    
    supplier.update_balance()
    print(f"   ✅ After payment, balance: {supplier.current_balance}")
    
    # Clean up test transaction
    payment_tx.delete()
    supplier.update_balance()
    print(f"   🧹 After cleanup, balance: {supplier.current_balance}")

if __name__ == '__main__':
    diagnose_supplier_credit_issues()
    fix_existing_purchases()
    test_supplier_balance_calculation()
    print("\n🎉 Supplier credit diagnosis and fixes completed!")
