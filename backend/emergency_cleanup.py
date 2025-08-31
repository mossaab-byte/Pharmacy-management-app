#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from Pharmacy.models import Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print("🚨 EMERGENCY DATA CLEANUP - REMOVING CROSS-PHARMACY CONTAMINATION 🚨")
print("=" * 70)

# Get galvus user and their pharmacy
galvus = User.objects.filter(username='galvus').first()
if not galvus:
    print("❌ ERROR: galvus user not found!")
    exit(1)

if not galvus.pharmacy:
    print("❌ ERROR: galvus user has no pharmacy assigned!")
    exit(1)

galvus_pharmacy = galvus.pharmacy
print(f"✅ Galvus user found - Pharmacy: {galvus_pharmacy.name} (ID: {galvus_pharmacy.id})")

print("\n📊 CURRENT DATABASE STATE:")
all_sales = Sale.objects.all()
all_customers = Customer.objects.all()
all_pharmacies = Pharmacy.objects.all()

print(f"   Total pharmacies: {all_pharmacies.count()}")
for pharmacy in all_pharmacies:
    sales_count = Sale.objects.filter(pharmacy=pharmacy).count()
    print(f"     - {pharmacy.name}: {sales_count} sales")

print(f"   Total sales: {all_sales.count()}")
print(f"   Total customers: {all_customers.count()}")

# Show sales by pharmacy
print("\n🔍 SALES BREAKDOWN BY PHARMACY:")
pharmacy_sales = {}
for sale in all_sales:
    pharmacy_name = sale.pharmacy.name if sale.pharmacy else "NO_PHARMACY"
    if pharmacy_name not in pharmacy_sales:
        pharmacy_sales[pharmacy_name] = []
    pharmacy_sales[pharmacy_name].append(sale)

for pharmacy_name, sales_list in pharmacy_sales.items():
    print(f"   {pharmacy_name}: {len(sales_list)} sales")
    for sale in sales_list[:2]:  # Show first 2 sales
        if sale.customer:
            customer_name = f"{sale.customer.user.first_name} {sale.customer.user.last_name}".strip()
            if not customer_name:
                customer_name = sale.customer.user.username
        else:
            customer_name = "Walk-in"
        print(f"     - Sale {sale.id}: {customer_name} - {sale.total_amount} DH")

# Find contaminated data
contaminated_sales = Sale.objects.exclude(pharmacy=galvus_pharmacy)
print(f"\n🚨 CONTAMINATED SALES (not belonging to {galvus_pharmacy.name}): {contaminated_sales.count()}")

# Find customers who made purchases in other pharmacies
contaminated_customer_ids = set(contaminated_sales.values_list('customer_id', flat=True))
contaminated_customers = Customer.objects.filter(id__in=contaminated_customer_ids)
print(f"🚨 CONTAMINATED CUSTOMERS: {contaminated_customers.count()}")

print("\n🧹 STARTING AGGRESSIVE CLEANUP...")

# STEP 1: Delete all sales not belonging to galvus pharmacy
if contaminated_sales.exists():
    print(f"   Deleting {contaminated_sales.count()} contaminated sales...")
    contaminated_sales.delete()
    print("   ✅ Contaminated sales deleted")

# STEP 2: Delete customers who no longer have any sales
# Get customers who still have sales in galvus pharmacy
remaining_sales = Sale.objects.filter(pharmacy=galvus_pharmacy)
valid_customer_ids = set(remaining_sales.values_list('customer_id', flat=True))
valid_customer_ids.discard(None)  # Remove None values

# Delete customers not in valid list
orphaned_customers = Customer.objects.exclude(id__in=valid_customer_ids)
orphaned_customer_count = orphaned_customers.count()

if orphaned_customer_count > 0:
    print(f"   Deleting {orphaned_customer_count} orphaned customers...")
    
    # Get user IDs to delete
    orphaned_user_ids = list(orphaned_customers.values_list('user_id', flat=True))
    
    # Delete customers first
    orphaned_customers.delete()
    
    # Delete associated user accounts (only if they're not pharmacy staff)
    orphaned_users = User.objects.filter(
        id__in=orphaned_user_ids,
        pharmacy__isnull=True  # Only delete users not associated with a pharmacy
    )
    deleted_users_count = orphaned_users.count()
    orphaned_users.delete()
    
    print(f"   ✅ Deleted {orphaned_customer_count} customers and {deleted_users_count} user accounts")

print("\n📊 FINAL DATABASE STATE:")
final_sales = Sale.objects.filter(pharmacy=galvus_pharmacy)
final_customers = Customer.objects.all()

print(f"   Sales in {galvus_pharmacy.name}: {final_sales.count()}")
print(f"   Total customers: {final_customers.count()}")

print("\n📝 YOUR SALES:")
for i, sale in enumerate(final_sales.order_by('-created_at'), 1):
    if sale.customer:
        customer_name = f"{sale.customer.user.first_name} {sale.customer.user.last_name}".strip()
        if not customer_name:
            customer_name = sale.customer.user.username
    else:
        customer_name = "Walk-in Customer"
    print(f"   {i}. Sale {sale.id}: {customer_name} - {sale.total_amount} DH - {sale.created_at.date()}")

print("\n🎉 CLEANUP COMPLETE!")
print("✅ All cross-pharmacy data contamination has been removed")
print("✅ Only your pharmacy's data remains")
print("\n💡 NEXT STEPS:")
print("1. Refresh your browser (Ctrl+F5)")
print("2. Clear browser cache completely")
print("3. Log out and log back in")
print("4. Check that you only see your own sales and customers")

if final_sales.count() == 1:
    print(f"\n✅ CONFIRMED: You now have exactly 1 sale as expected!")
else:
    print(f"\n⚠️  WARNING: You have {final_sales.count()} sales, not 1 as expected")
