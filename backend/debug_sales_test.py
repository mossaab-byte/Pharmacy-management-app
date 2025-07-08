#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from Sales.models import Customer, Sale, SaleItem, Payment
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine
from django.test import TransactionTestCase

User = get_user_model()

class DebugSalesTest(TransactionTestCase):
    """Debug sales filtering test"""
    
    def setUp(self):
        # Clear all existing data
        Sale.objects.all().delete()
        Pharmacy.objects.all().delete()
        User.objects.all().delete()
        
        # Create test users
        self.pharmacist = User.objects.create_user(
            username='pharmacist',
            email='pharmacist@test.com',
            password='test123',
            is_pharmacist=True
        )
        
        # Create pharmacy
        self.pharmacy = Pharmacy.objects.create(
            name='Test Pharmacy',
            address='123 Test St',
            phone='123456789',
            pharmacist=self.pharmacist
        )
        
        # Update pharmacist's pharmacy reference
        self.pharmacist.pharmacy = self.pharmacy
        self.pharmacist.save()

    def test_sales_filtering_debug(self):
        """Debug version of test_pharmacy_sales_filtering"""
        print(f"Initial sales count: {Sale.objects.count()}")
        
        # Create another pharmacy and pharmacist
        other_pharmacist = User.objects.create_user(
            username='other_pharmacist',
            email='other@test.com',
            password='test123',
            is_pharmacist=True
        )
        
        other_pharmacy = Pharmacy.objects.create(
            name='Other Pharmacy',
            address='456 Other St',
            phone='456789123',
            pharmacist=other_pharmacist
        )
        
        # Set the pharmacy relationship for the other pharmacist
        other_pharmacist.pharmacy = other_pharmacy
        other_pharmacist.save()
        
        print(f"Sales count after setup: {Sale.objects.count()}")
        
        # Create sales for both pharmacies
        sale1 = Sale.objects.create(
            pharmacy=self.pharmacy,
            served_by=self.pharmacist,
            total_amount=Decimal('50.00')
        )
        
        sale2 = Sale.objects.create(
            pharmacy=other_pharmacy,
            served_by=other_pharmacist,
            total_amount=Decimal('75.00')
        )
        
        print(f"Sales count after creating 2 sales: {Sale.objects.count()}")
        
        # Check what sales exist
        all_sales = Sale.objects.all()
        for sale in all_sales:
            print(f"Sale {sale.id}: pharmacy={sale.pharmacy.name if sale.pharmacy else 'None'}")
        
        # Test queryset filtering
        pharmacy1_sales = Sale.objects.filter(pharmacy=self.pharmacy)
        pharmacy2_sales = Sale.objects.filter(pharmacy=other_pharmacy)
        
        print(f"Pharmacy 1 sales count: {pharmacy1_sales.count()}")
        print(f"Pharmacy 2 sales count: {pharmacy2_sales.count()}")
        
        # Test user pharmacy reference
        print(f"Pharmacist 1 pharmacy: {self.pharmacist.pharmacy}")
        print(f"Pharmacist 2 pharmacy: {other_pharmacist.pharmacy}")

if __name__ == '__main__':
    test = DebugSalesTest()
    test.setUp()
    test.test_sales_filtering_debug()
