import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from Sales.models import Customer, Sale, SaleItem, Payment
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine

User = get_user_model()

def debug_sales_filtering():
    """Debug the sales filtering issue"""
    
    # Clear all existing data
    Sale.objects.all().delete()
    Pharmacy.objects.all().delete()
    User.objects.all().delete()
    
    print("=== Setting up test data ===")
    
    # Create test users
    pharmacist = User.objects.create_user(
        username='pharmacist',
        email='pharmacist@test.com',
        password='test123',
        is_pharmacist=True
    )
    
    other_pharmacist = User.objects.create_user(
        username='other_pharmacist',
        email='other@test.com',
        password='test123',
        is_pharmacist=True
    )
    
    # Create pharmacies
    pharmacy = Pharmacy.objects.create(
        name='Test Pharmacy',
        address='123 Test St',
        phone='123456789',
        pharmacist=pharmacist
    )
    
    other_pharmacy = Pharmacy.objects.create(
        name='Other Pharmacy',
        address='456 Other St',
        phone='456789123',
        pharmacist=other_pharmacist
    )
    
    # Set pharmacy relationships
    pharmacist.pharmacy = pharmacy
    pharmacist.save()
    
    other_pharmacist.pharmacy = other_pharmacy
    other_pharmacist.save()
    
    print(f"Created pharmacist: {pharmacist.username} with pharmacy: {pharmacist.pharmacy}")
    print(f"Created other_pharmacist: {other_pharmacist.username} with pharmacy: {other_pharmacist.pharmacy}")
    
    # Create sales
    sale1 = Sale.objects.create(
        pharmacy=pharmacy,
        served_by=pharmacist,
        total_amount=Decimal('50.00')
    )
    
    sale2 = Sale.objects.create(
        pharmacy=other_pharmacy,
        served_by=other_pharmacist,
        total_amount=Decimal('75.00')
    )
    
    print(f"Created sale1: {sale1.id} for pharmacy: {sale1.pharmacy.name}")
    print(f"Created sale2: {sale2.id} for pharmacy: {sale2.pharmacy.name}")
    
    # Check total sales
    all_sales = Sale.objects.all()
    print(f"\nTotal sales in database: {all_sales.count()}")
    for sale in all_sales:
        print(f"  Sale {sale.id}: pharmacy={sale.pharmacy.name}, served_by={sale.served_by.username if sale.served_by else 'None'}")
    
    # Test API filtering
    from Sales.views import SalesViewSet
    
    print("\n=== Testing API filtering ===")
    
    # Test for pharmacist 1
    print(f"\nTesting for pharmacist: {pharmacist.username}")
    print(f"Pharmacist pharmacy: {pharmacist.pharmacy}")
    
    if hasattr(pharmacist, 'pharmacy'):
        filtered_sales = Sale.objects.filter(pharmacy=pharmacist.pharmacy)
        print(f"Filtered sales for pharmacist: {filtered_sales.count()}")
        for sale in filtered_sales:
            print(f"  Sale {sale.id}: pharmacy={sale.pharmacy.name}")
    else:
        print("Pharmacist has no pharmacy attribute!")
    
    # Test for pharmacist 2
    print(f"\nTesting for other_pharmacist: {other_pharmacist.username}")
    print(f"Other pharmacist pharmacy: {other_pharmacist.pharmacy}")
    
    if hasattr(other_pharmacist, 'pharmacy'):
        filtered_sales = Sale.objects.filter(pharmacy=other_pharmacist.pharmacy)
        print(f"Filtered sales for other_pharmacist: {filtered_sales.count()}")
        for sale in filtered_sales:
            print(f"  Sale {sale.id}: pharmacy={sale.pharmacy.name}")
    else:
        print("Other pharmacist has no pharmacy attribute!")

    # Test the actual API
    print("\n=== Testing actual API calls ===")
    
    client = APIClient()
    
    # Test API call for pharmacist 1
    client.force_authenticate(user=pharmacist)
    response1 = client.get('/api/sales/sales/')
    print(f"API response for pharmacist: status={response1.status_code}, count={len(response1.data)}")
    print(f"Response data type: {type(response1.data)}")
    print(f"Response data: {response1.data}")
    if hasattr(response1.data, '__iter__') and len(response1.data) > 0:
        if isinstance(response1.data[0], dict):
            for sale_data in response1.data:
                print(f"  Returned sale: {sale_data.get('id', 'no-id')}")
        else:
            print(f"  First item type: {type(response1.data[0])}")
    
    # Test API call for pharmacist 2  
    client.force_authenticate(user=other_pharmacist)
    response2 = client.get('/api/sales/sales/')
    print(f"API response for other_pharmacist: status={response2.status_code}, count={len(response2.data)}")
    print(f"Response data: {response2.data}")
    if hasattr(response2.data, '__iter__') and len(response2.data) > 0:
        if isinstance(response2.data[0], dict):
            for sale_data in response2.data:
                print(f"  Returned sale: {sale_data.get('id', 'no-id')}")
        else:
            print(f"  First item type: {type(response2.data[0])}")

if __name__ == '__main__':
    debug_sales_filtering()
