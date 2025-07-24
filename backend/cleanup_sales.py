#!/usr/bin/env python
"""
Sales Data Cleanup Script
Identifies and fixes issues with sales data that might be causing API failures.
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Sales.models import Sale, SaleItem, Customer
from Pharmacy.models import PharmacyMedicine
from django.db import transaction
from decimal import Decimal

User = get_user_model()

def diagnose_sales_issues():
    """Diagnose and fix sales-related issues"""
    print("\n🔍 SALES DATA DIAGNOSIS")
    print("=" * 40)
    
    # Check sales count
    total_sales = Sale.objects.count()
    print(f"📊 Total sales in database: {total_sales}")
    
    if total_sales == 0:
        print("ℹ️ No sales found - this might be why the page shows 'No sales found'")
        return
    
    # Check for sales with missing customers
    sales_without_customers = Sale.objects.filter(customer__isnull=True).count()
    sales_with_customers = Sale.objects.filter(customer__isnull=False).count()
    
    print(f"👥 Sales with customers: {sales_with_customers}")
    print(f"❓ Sales without customers: {sales_without_customers}")
    
    # Check for sales with invalid customer references
    problematic_sales = []
    all_sales = Sale.objects.all()
    
    for sale in all_sales:
        issues = []
        
        # Check customer relationship
        if sale.customer:
            if not sale.customer.user:
                issues.append("Customer has no user")
            elif not User.objects.filter(id=sale.customer.user.id).exists():
                issues.append("Customer's user doesn't exist")
        
        # Check served_by relationship
        if sale.served_by:
            if not User.objects.filter(id=sale.served_by.id).exists():
                issues.append("served_by user doesn't exist")
        
        # Check pharmacy relationship
        if not sale.pharmacy:
            issues.append("No pharmacy associated")
        
        # Check sale items
        items_count = sale.items.count()
        if items_count == 0:
            issues.append("No sale items")
        else:
            # Check if sale items have valid pharmacy medicines
            for item in sale.items.all():
                if not item.pharmacy_medicine:
                    issues.append("Sale item has no pharmacy_medicine")
                elif not PharmacyMedicine.objects.filter(id=item.pharmacy_medicine.id).exists():
                    issues.append("Sale item's pharmacy_medicine doesn't exist")
        
        # Check total calculation
        if sale.total_amount is None:
            issues.append("Total amount is None")
        elif sale.total_amount < 0:
            issues.append("Negative total amount")
        
        if issues:
            problematic_sales.append({
                'sale': sale,
                'issues': issues
            })
    
    print(f"\n⚠️ Found {len(problematic_sales)} problematic sales:")
    
    for item in problematic_sales:
        sale = item['sale']
        issues = item['issues']
        print(f"  Sale #{sale.reference or sale.id}: {', '.join(issues)}")
    
    return problematic_sales

def fix_sales_issues(problematic_sales):
    """Fix or remove problematic sales"""
    print(f"\n🔧 FIXING SALES ISSUES")
    print("=" * 30)
    
    if not problematic_sales:
        print("✅ No problematic sales to fix!")
        return
    
    fixed_count = 0
    deleted_count = 0
    
    for item in problematic_sales:
        sale = item['sale']
        issues = item['issues']
        
        print(f"\n🔍 Processing Sale #{sale.reference or sale.id}:")
        print(f"   Issues: {', '.join(issues)}")
        
        # Determine if we can fix or should delete
        can_fix = True
        
        # Check if it's too broken to fix
        critical_issues = [
            "Customer's user doesn't exist",
            "served_by user doesn't exist", 
            "Sale item's pharmacy_medicine doesn't exist"
        ]
        
        has_critical_issues = any(issue in issues for issue in critical_issues)
        
        if has_critical_issues or "No sale items" in issues:
            # Delete this sale as it's too broken
            print(f"   ❌ Deleting sale (too broken to fix)")
            try:
                with transaction.atomic():
                    # Delete sale items first
                    sale.items.all().delete()
                    # Delete the sale
                    sale.delete()
                    deleted_count += 1
                    print(f"   ✅ Sale deleted successfully")
            except Exception as e:
                print(f"   ❌ Error deleting sale: {str(e)}")
        else:
            # Try to fix the sale
            print(f"   🔧 Attempting to fix sale...")
            try:
                with transaction.atomic():
                    # Fix missing customer (set to None for walk-in)
                    if "Customer has no user" in issues:
                        sale.customer = None
                        print(f"      - Set customer to None (walk-in)")
                    
                    # Fix missing pharmacy
                    if "No pharmacy associated" in issues:
                        from Pharmacy.models import Pharmacy
                        pharmacy = Pharmacy.objects.first()
                        if pharmacy:
                            sale.pharmacy = pharmacy
                            print(f"      - Set pharmacy to {pharmacy.name}")
                    
                    # Fix missing served_by
                    if not sale.served_by:
                        admin_user = User.objects.filter(is_staff=True).first()
                        if admin_user:
                            sale.served_by = admin_user
                            print(f"      - Set served_by to {admin_user.username}")
                    
                    # Fix total amount
                    if "Total amount is None" in issues or "Negative total amount" in issues:
                        items_total = sum(item.subtotal or 0 for item in sale.items.all())
                        sale.total_amount = Decimal(str(items_total))
                        print(f"      - Recalculated total: {sale.total_amount}")
                    
                    sale.save()
                    fixed_count += 1
                    print(f"   ✅ Sale fixed successfully")
                    
            except Exception as e:
                print(f"   ❌ Error fixing sale: {str(e)}")
    
    print(f"\n📋 SUMMARY:")
    print(f"✅ Fixed: {fixed_count} sales")
    print(f"❌ Deleted: {deleted_count} sales")
    print(f"📊 Remaining sales: {Sale.objects.count()}")

def test_sales_serialization():
    """Test if sales can be serialized without errors"""
    print(f"\n🧪 TESTING SALES SERIALIZATION")
    print("=" * 35)
    
    try:
        from Sales.serializers import SaleSerializer
        
        sales = Sale.objects.all()[:5]  # Test first 5 sales
        
        if not sales:
            print("ℹ️ No sales to test serialization")
            return True
            
        print(f"🔍 Testing serialization for {len(sales)} sales...")
        
        # Test serialization
        serializer = SaleSerializer(sales, many=True)
        data = serializer.data  # This will trigger the actual serialization
        
        print(f"✅ Serialization successful!")
        print(f"📊 Serialized {len(data)} sales")
        
        if data:
            sample_sale = data[0]
            print(f"📄 Sample sale data:")
            print(f"   - ID: {sample_sale.get('id')}")
            print(f"   - Reference: {sample_sale.get('reference', 'N/A')}")
            print(f"   - Total: {sample_sale.get('total', 'N/A')}")
            print(f"   - Customer: {sample_sale.get('customer_name', 'N/A')}")
            print(f"   - Items: {sample_sale.get('items_count', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Serialization failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    try:
        print("🏥 PHARMACY SALES DIAGNOSTIC & CLEANUP TOOL")
        print("=" * 50)
        
        # Step 1: Diagnose issues
        problematic_sales = diagnose_sales_issues()
        
        # Step 2: Fix issues if any found
        if problematic_sales:
            user_input = input("\n❓ Do you want to fix/clean up problematic sales? (y/n): ").lower().strip()
            if user_input == 'y':
                fix_sales_issues(problematic_sales)
            else:
                print("⏭️ Skipping cleanup...")
        
        # Step 3: Test serialization
        test_sales_serialization()
        
        print(f"\n🎉 Cleanup complete! Try refreshing the sales page now.")
        print(f"🔗 Test URL: http://localhost:3000/sales")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {str(e)}")
        import traceback
        traceback.print_exc()
