import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Sales.models import Sale
from Pharmacy.models import Pharmacy
from django.db.models import Sum

User = get_user_model()

print('=== ALL USERS AND THEIR PHARMACIES ===')
for user in User.objects.all():
    pharmacy = getattr(user, 'pharmacy', None)
    print(f'User: {user.username} | Pharmacy: {pharmacy} | Pharmacy ID: {getattr(pharmacy, "id", None)}')

print()
print('=== ALL SALES AND THEIR PHARMACIES ===')
for sale in Sale.objects.all():
    print(f'Sale ID: {sale.id} | Amount: {sale.total_amount} | Pharmacy: {sale.pharmacy} | Pharmacy ID: {sale.pharmacy.id}')

print()
print('=== ALL PHARMACIES ===')
for pharmacy in Pharmacy.objects.all():
    print(f'Pharmacy: {pharmacy.name} | ID: {pharmacy.id}')
    sales_total = Sale.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('total_amount'))['total'] or 0
    print(f'  Total Sales: {sales_total}')

print()
print('=== USER-PHARMACY MISMATCHES ===')
all_users = User.objects.all()
all_sales = Sale.objects.all()

for user in all_users:
    if hasattr(user, 'pharmacy') and user.pharmacy:
        user_sales = Sale.objects.filter(pharmacy=user.pharmacy)
        print(f'User {user.username} (Pharmacy: {user.pharmacy.name}) has {user_sales.count()} sales')
        total = user_sales.aggregate(total=Sum('total_amount'))['total'] or 0
        print(f'  Total amount: {total}')
    else:
        print(f'User {user.username} has NO PHARMACY assigned')
