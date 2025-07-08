# tests/test_inventory.py
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine
from Inventory.models import InventoryLog

User = get_user_model()

class InventoryTestCase(APITestCase):
    """Test inventory management functionality"""
    
    def setUp(self):
        # Create test user and pharmacy
        self.pharmacist = User.objects.create_user(
            username='pharmacist',
            email='pharmacist@test.com',
            password='test123',
            is_pharmacist=True
        )
        
        self.pharmacy = Pharmacy.objects.create(
            name='Test Pharmacy',
            address='123 Test St',
            phone='123456789',
            pharmacist=self.pharmacist
        )
        
        self.pharmacist.pharmacy = self.pharmacy
        self.pharmacist.save()
        
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
            cost_price=Decimal('20.00'),
            minimum_stock_level=10
        )

    def test_add_stock(self):
        """Test adding stock to pharmacy medicine"""
        initial_quantity = self.pharmacy_medicine.quantity
        
        # Add stock
        self.pharmacy_medicine.add_stock(
            amount=50,
            user=self.pharmacist,
            reason='PURCHASE'
        )
        
        # Check that quantity increased
        self.pharmacy_medicine.refresh_from_db()
        expected_quantity = initial_quantity + 50
        self.assertEqual(self.pharmacy_medicine.quantity, expected_quantity)
        
        # Check that inventory log was created
        log = InventoryLog.objects.filter(
            pharmacy_medicine=self.pharmacy_medicine,
            transaction_type='ADD'
        ).first()
        
        self.assertIsNotNone(log)
        self.assertEqual(log.quantity_changed, 50)
        self.assertEqual(log.reason, 'PURCHASE')
        self.assertEqual(log.performed_by, self.pharmacist)

    def test_reduce_stock_success(self):
        """Test reducing stock when sufficient quantity available"""
        initial_quantity = self.pharmacy_medicine.quantity
        
        # Reduce stock
        success = self.pharmacy_medicine.reduce_stock(
            amount=30,
            user=self.pharmacist,
            reason='SALE'
        )
        
        # Check that operation was successful
        self.assertTrue(success)
        
        # Check that quantity decreased
        self.pharmacy_medicine.refresh_from_db()
        expected_quantity = initial_quantity - 30
        self.assertEqual(self.pharmacy_medicine.quantity, expected_quantity)
        
        # Check that inventory log was created
        log = InventoryLog.objects.filter(
            pharmacy_medicine=self.pharmacy_medicine,
            transaction_type='REDUCE'
        ).first()
        
        self.assertIsNotNone(log)
        self.assertEqual(log.quantity_changed, 30)
        self.assertEqual(log.reason, 'SALE')

    def test_reduce_stock_insufficient(self):
        """Test reducing stock when insufficient quantity available"""
        # Try to reduce more stock than available
        success = self.pharmacy_medicine.reduce_stock(
            amount=150,  # More than the 100 available
            user=self.pharmacist,
            reason='SALE'
        )
        
        # Check that operation failed
        self.assertFalse(success)
        
        # Check that quantity remained unchanged
        self.pharmacy_medicine.refresh_from_db()
        self.assertEqual(self.pharmacy_medicine.quantity, 100)

    def test_add_stock_api_endpoint(self):
        """Test adding stock via API endpoint"""
        self.client.force_authenticate(user=self.pharmacist)
        
        data = {
            'amount': 25,
            'reason': 'RESTOCKING'
        }
        
        url = f'/api/pharmacy/medicines/{self.pharmacy_medicine.id}/add_stock/'
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'stock added')
        
        # Verify stock was added
        self.pharmacy_medicine.refresh_from_db()
        self.assertEqual(self.pharmacy_medicine.quantity, 125)

    def test_reduce_stock_api_endpoint(self):
        """Test reducing stock via API endpoint"""
        self.client.force_authenticate(user=self.pharmacist)
        
        data = {
            'amount': 15,
            'reason': 'DAMAGED'
        }
        
        url = f'/api/pharmacy/medicines/{self.pharmacy_medicine.id}/reduce_stock/'
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'stock reduced')
        
        # Verify stock was reduced
        self.pharmacy_medicine.refresh_from_db()
        self.assertEqual(self.pharmacy_medicine.quantity, 85)

    def test_stock_history_api_endpoint(self):
        """Test retrieving stock history via API"""
        self.client.force_authenticate(user=self.pharmacist)
        
        # Add some stock movements
        self.pharmacy_medicine.add_stock(20, self.pharmacist, 'PURCHASE')
        self.pharmacy_medicine.reduce_stock(5, self.pharmacist, 'SALE')
        
        url = f'/api/pharmacy/medicines/{self.pharmacy_medicine.id}/stock_history/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Check that history is ordered by timestamp (most recent first)
        first_entry = response.data[0]
        self.assertEqual(first_entry['quantity_changed'], 5)
        self.assertEqual(first_entry['reason'], 'SALE')

    def test_bulk_add_medicines(self):
        """Test bulk adding medicines to pharmacy inventory"""
        self.client.force_authenticate(user=self.pharmacist)
        
        # Create another medicine
        medicine2 = Medicine.objects.create(
            nom='Another Medicine',
            code='TEST002',
            prix_br=Decimal('15.00'),
            ph=Decimal('12.00')
        )
        
        bulk_data = [
            {
                'medicine_id': self.medicine.id,
                'quantity': 50,
                'reason': 'BULK_PURCHASE'
            },
            {
                'medicine_id': medicine2.id,
                'quantity': 30,
                'reason': 'BULK_PURCHASE'
            }
        ]
        
        response = self.client.post('/api/pharmacy/medicines/bulk-add/', bulk_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['added']), 2)
        self.assertEqual(len(response.data['errors']), 0)
        
        # Verify stock was added to existing medicine
        self.pharmacy_medicine.refresh_from_db()
        self.assertEqual(self.pharmacy_medicine.quantity, 150)  # 100 + 50
        
        # Verify new pharmacy medicine was created
        pharmacy_medicine2 = PharmacyMedicine.objects.get(
            pharmacy=self.pharmacy,
            medicine=medicine2
        )
        self.assertEqual(pharmacy_medicine2.quantity, 30)

    def test_minimum_stock_level_warning(self):
        """Test minimum stock level detection"""
        # Reduce stock below minimum level
        self.pharmacy_medicine.reduce_stock(
            amount=95,  # This will leave 5, which is below minimum of 10
            user=self.pharmacist,
            reason='SALE'
        )
        
        # Check that medicine is now below minimum stock level
        self.pharmacy_medicine.refresh_from_db()
        self.assertTrue(self.pharmacy_medicine.quantity < self.pharmacy_medicine.minimum_stock_level)

    def test_inventory_permissions(self):
        """Test that only authorized users can manage inventory"""
        # Create a customer user (should not have inventory permissions)
        customer = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            password='test123',
            is_customer=True
        )
        
        self.client.force_authenticate(user=customer)
        
        data = {
            'amount': 10,
            'reason': 'PURCHASE'
        }
        
        url = f'/api/pharmacy/medicines/{self.pharmacy_medicine.id}/add_stock/'
        response = self.client.post(url, data)
        
        # Should be forbidden for customer
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PharmacyMedicineModelTestCase(TestCase):
    """Test PharmacyMedicine model functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testpharmacist',
            email='test@pharmacy.com',
            password='test123'
        )
        
        self.pharmacy = Pharmacy.objects.create(
            name='Test Pharmacy',
            address='Test Address',
            phone='123456789',
            pharmacist=self.user
        )
        
        self.medicine = Medicine.objects.create(
            nom='Test Medicine',
            code='TEST001',
            prix_br=Decimal('25.00')
        )
        
        self.pharmacy_medicine = PharmacyMedicine.objects.create(
            pharmacy=self.pharmacy,
            medicine=self.medicine,
            quantity=50,
            minimum_stock_level=10
        )

    def test_pharmacy_medicine_string_representation(self):
        """Test string representation of PharmacyMedicine"""
        expected_string = f"{self.medicine.nom} at {self.pharmacy.name}"
        self.assertEqual(str(self.pharmacy_medicine), expected_string)

    def test_quantity_at_specific_date(self):
        """Test retrieving quantity at a specific date"""
        # This test would require more complex setup with InventoryLog entries
        # For now, just test that the method exists and doesn't crash
        from django.utils import timezone
        import datetime
        
        date = timezone.now().date() - datetime.timedelta(days=1)
        quantity = self.pharmacy_medicine.quantity_at(date)
        
        # Should return current quantity if no history exists
        self.assertEqual(quantity, 50)
