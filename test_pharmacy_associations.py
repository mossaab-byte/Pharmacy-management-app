import os, django
import sys
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem
from Pharmacy.models import PharmacyMedicine, Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print('=== PHARMACY ASSOCIATION DIAGNOSIS ===')

# List all pharmacies
all_pharmacies = Pharmacy.objects.all()
print(f'Total pharmacies: {all_pharmacies.count()}')
for pharmacy in all_pharmacies:
    pm_count = PharmacyMedicine.objects.filter(pharmacy=pharmacy).count()
    sales_count = Sale.objects.filter(pharmacy=pharmacy).count()
    print(f'  - {pharmacy.name}: {pm_count} medicines, {sales_count} sales')

print(f'\n=== USER PHARMACY ASSOCIATIONS ===')
all_users = User.objects.all()[:10]
for user in all_users:
    pharmacy_name = user.pharmacy.name if user.pharmacy else 'No pharmacy'
    print(f'  - {user.username} -> {pharmacy_name}')

print(f'\n=== RECENT SALES ANALYSIS ===')
recent_sales = Sale.objects.all().order_by('-created_at')[:5]
for sale in recent_sales:
    print(f'Sale {sale.id}: Pharmacy={sale.pharmacy.name}, Items={sale.items.count()}')
    for item in sale.items.all():
        pm = item.pharmacy_medicine
        print(f'  - Medicine: {pm.medicine.nom}, Pharmacy: {pm.pharmacy.name}, Current Stock: {pm.quantity}')

print(f'\n=== INVENTORY DISTRIBUTION ===')
for pharmacy in all_pharmacies:
    pm_items = PharmacyMedicine.objects.filter(pharmacy=pharmacy)[:3]
    if pm_items.exists():
        print(f'{pharmacy.name} inventory samples:')
        for pm in pm_items:
            print(f'  - {pm.medicine.nom}: Stock={pm.quantity}')
