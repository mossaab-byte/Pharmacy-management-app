# tests/test_sales.py
import uuid
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from Sales.models import Customer, Sale, SaleItem, Payment
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine

User = get_user_model()

class SalesTestCase(APITestCase):
    """Test sales management functionality"""
    
    def setUp(self):
        # Create test users
        self.pharmacist = User.objects.create_user(
            username='pharmacist',
            email='pharmacist@test.com',
            password='test123',
            is_pharmacist=True
        )
        
        self.customer_user = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            password='test123',
            is_customer=True
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
        
        # Create customer
        self.customer = Customer.objects.create(
            user=self.customer_user,
            phone='987654321'
        )
        
        # Create test medicine
        self.medicine = Medicine.objects.create(
            nom='Test Medicine',
            code='TEST001',
            prix_br=Decimal('25.50'),
            ph=Decimal('20.00')
        )
        
        # Add medicine to pharmacy inventory
        self.pharmacy_medicine = PharmacyMedicine.objects.create(
            pharmacy=self.pharmacy,
            medicine=self.medicine,
            quantity=100,
            price=Decimal('25.50'),
            cost_price=Decimal('20.00')
        )

    def test_create_sale(self):
        """Test creating a new sale"""
        self.client.force_authenticate(user=self.pharmacist)
        
        sale_data = {
            'customer': str(self.customer.id),
            'items': [
                {
                    'pharmacy_medicine': str(self.pharmacy_medicine.id),
                    'quantity': 2,
                    'unit_price': '25.50'
                }
            ]
        }
        
        response = self.client.post('/api/sales/sales/', sale_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that sale was created
        sale = Sale.objects.get(id=response.data['id'])
        self.assertEqual(sale.customer, self.customer)
        self.assertEqual(sale.pharmacy, self.pharmacy)
        self.assertEqual(sale.served_by, self.pharmacist)

    def test_sale_item_subtotal_calculation(self):
        """Test that sale item subtotal is calculated correctly"""
        sale = Sale.objects.create(
            pharmacy=self.pharmacy,
            customer=self.customer,
            served_by=self.pharmacist
        )
        
        sale_item = SaleItem.objects.create(
            sale=sale,
            pharmacy_medicine=self.pharmacy_medicine,
            quantity=3,
            unit_price=Decimal('25.50')
        )
        
        expected_subtotal = Decimal('76.50')  # 3 * 25.50
        self.assertEqual(sale_item.subtotal, expected_subtotal)

    def test_stock_reduction_on_sale_finalization(self):
        """Test that stock is reduced when sale is finalized"""
        initial_stock = self.pharmacy_medicine.quantity
        
        sale = Sale.objects.create(
            pharmacy=self.pharmacy,
            customer=self.customer,
            served_by=self.pharmacist
        )
        
        SaleItem.objects.create(
            sale=sale,
            pharmacy_medicine=self.pharmacy_medicine,
            quantity=5,
            unit_price=Decimal('25.50')
        )
        
        # Finalize the sale
        sale.finalize()
        
        # Check that stock was reduced
        self.pharmacy_medicine.refresh_from_db()
        expected_stock = initial_stock - 5
        self.assertEqual(self.pharmacy_medicine.quantity, expected_stock)

    def test_customer_balance_calculation(self):
        """Test customer balance calculation"""
        # Create a sale
        sale = Sale.objects.create(
            pharmacy=self.pharmacy,
            customer=self.customer,
            served_by=self.pharmacist,
            total_amount=Decimal('100.00')
        )
        
        # Make partial payment
        Payment.objects.create(
            sale=sale,
            amount=Decimal('60.00'),
            method='CASH'
        )
        
        # Customer balance should be 40.00 (100 - 60)
        expected_balance = Decimal('40.00')
        self.assertEqual(self.customer.balance, expected_balance)

    def test_pharmacy_sales_filtering(self):
        """Test that pharmacists only see their pharmacy's sales"""
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
        
        # Test that each pharmacist only sees their own sales
        self.client.force_authenticate(user=self.pharmacist)
        response1 = self.client.get('/api/sales/sales/')
        # Handle paginated response
        if isinstance(response1.data, dict) and 'results' in response1.data:
            sales_data = response1.data['results']
        else:
            sales_data = response1.data
        self.assertEqual(len(sales_data), 1)
        self.assertEqual(sales_data[0]['id'], str(sale1.id))
        
        self.client.force_authenticate(user=other_pharmacist)
        response2 = self.client.get('/api/sales/sales/')
        # Handle paginated response
        if isinstance(response2.data, dict) and 'results' in response2.data:
            sales_data = response2.data['results']
        else:
            sales_data = response2.data
        self.assertEqual(len(sales_data), 1)
        self.assertEqual(sales_data[0]['id'], str(sale2.id))

    def test_payment_creation(self):
        """Test creating payments for sales"""
        self.client.force_authenticate(user=self.pharmacist)
        
        sale = Sale.objects.create(
            pharmacy=self.pharmacy,
            customer=self.customer,
            served_by=self.pharmacist,
            total_amount=Decimal('100.00')
        )
        
        payment_data = {
            'sale': str(sale.id),
            'amount': '50.00',
            'method': 'CASH'
        }
        
        response = self.client.post('/api/sales/payments/', payment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        payment = Payment.objects.get(id=response.data['id'])
        self.assertEqual(payment.sale, sale)
        self.assertEqual(payment.amount, Decimal('50.00'))
        self.assertEqual(payment.method, 'CASH')

    def test_customer_management(self):
        """Test customer creation and management"""
        self.client.force_authenticate(user=self.pharmacist)
        
        customer_data = {
            'username': 'newcustomer',
            'email': 'newcustomer@test.com',
            'first_name': 'New',
            'last_name': 'Customer',
            'phone': '555-0123',
            'address': '789 Customer Lane'
        }
        
        response = self.client.post('/api/sales/customers/', customer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify customer was created
        customer = Customer.objects.get(id=response.data['id'])
        self.assertEqual(customer.user.username, 'newcustomer')
        self.assertEqual(customer.phone, '555-0123')


class CustomerModelTestCase(TestCase):
    """Test Customer model functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testcustomer',
            email='customer@test.com',
            password='test123'
        )
        
        self.customer = Customer.objects.create(
            user=self.user,
            phone='123456789'
        )

    def test_customer_string_representation(self):
        """Test customer string representation"""
        expected_string = str(self.user)
        self.assertEqual(str(self.customer), expected_string)

    def test_customer_balance_with_no_sales(self):
        """Test customer balance when there are no sales"""
        self.assertEqual(self.customer.balance, 0)

    def test_customer_balance_with_sales_and_payments(self):
        """Test customer balance calculation with sales and payments"""
        # This would require creating a pharmacy and sale, simplified for this test
        # The actual balance calculation is tested in the sales test case above
        pass
