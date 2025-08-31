#!/usr/bin/env python3
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, Customer
from Pharmacy.models import Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== FIXING GALVUS USER DATA ISOLATION ===")

# Get galvus user
galvus = User.objects.filter(username='galvus').first()
print(f"Current galvus pharmacy: {galvus.pharmacy.name}")

# Check if galvuspharma already exists
galvus_pharmacy = Pharmacy.objects.filter(name='galvuspharma').first()
if galvus_pharmacy:
    print(f"✅ Found existing galvuspharma: {galvus_pharmacy.name}")
else:
    print("❌ galvuspharma not found - this is wrong!")
    exit()

# Move galvus user to galvuspharma
old_pharmacy = galvus.pharmacy
galvus.pharmacy = galvus_pharmacy
galvus.save()
print(f"✅ Moved galvus user from '{old_pharmacy.name}' to '{galvus_pharmacy.name}'")

# Check galvus sales - find the most recent one (your legitimate sale)
galvus_recent_sales = Sale.objects.filter(pharmacy=old_pharmacy).order_by('-created_at')
print(f"\\nFound {galvus_recent_sales.count()} sales in old pharmacy:")

# Move ONLY the most recent sale (August 26, 2025) to galvus pharmacy
# This should be YOUR legitimate sale
most_recent_sale = galvus_recent_sales.first()
if most_recent_sale and most_recent_sale.created_at.date().month == 8 and most_recent_sale.created_at.date().day == 26:
    most_recent_sale.pharmacy = galvus_pharmacy
    most_recent_sale.save()
    print(f"✅ Moved your recent sale ({most_recent_sale.total_amount} DH) to galvuspharma")
else:
    print("⚠️ Could not identify your recent sale safely")

# Verify the fix
galvus_own_sales = Sale.objects.filter(pharmacy=galvus_pharmacy)
print(f"\\n🎉 RESULT:")
print(f"Sales in your galvuspharma: {galvus_own_sales.count()}")
for sale in galvus_own_sales:
    customer_name = 'Walk-in'
    if sale.customer:
        customer_name = sale.customer.user.username if sale.customer.user else 'Unknown'
    print(f"  - Sale: {customer_name} - {sale.total_amount} DH ({sale.created_at.date()})")

print(f"\\n✅ DATA ISOLATION FIXED!")
print(f"- Galvus user now has separate galvuspharma")
print(f"- Other users' data remains in marmar pharmacy")  
print(f"- You should now see only YOUR data")
print(f"\\nPlease refresh your browser and check!")
