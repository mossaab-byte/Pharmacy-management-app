import os, django
import sys
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Customer
from django.contrib.auth import get_user_model

User = get_user_model()

print('=== CUSTOMER ANALYSIS ===')
print(f'Total customers: {Customer.objects.count()}')
print(f'Total users: {User.objects.count()}')

print('\nAll customers:')
for customer in Customer.objects.all()[:10]:
    user_info = f'{customer.user.first_name} {customer.user.last_name}' if customer.user else 'No user'
    username = customer.user.username if customer.user else 'N/A'
    print(f'  - {customer.id}: {user_info} ({username})')

print('\nChecking for marouane:')
marouane_users = User.objects.filter(username__icontains='marouane')
for user in marouane_users:
    print(f'  User: {user.username} - {user.first_name} {user.last_name}')
    customer = Customer.objects.filter(user=user).first()
    if customer:
        print(f'    Has customer record: {customer.id}')
    else:
        print('    No customer record')
