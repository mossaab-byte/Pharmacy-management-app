# tests/test_authentication.py
import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from Pharmacy.models import Pharmacy

User = get_user_model()

class AuthenticationTestCase(APITestCase):
    """Test user authentication and registration"""
    
    def setUp(self):
        self.register_user_url = reverse('register-user')
        self.register_pharmacy_url = reverse('register-pharmacy')
        self.login_url = reverse('token_obtain_pair')
        self.user_data = {
            'username': 'testpharmacist',
            'email': 'pharmacist@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        self.pharmacy_data = {
            'name': 'Test Pharmacy',
            'address': '123 Test Street, Test City',
            'phone': '+123456789'
        }

    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.client.post(self.register_user_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testpharmacist').exists())
        
        # Check that user data is correctly set
        user = User.objects.get(username='testpharmacist')
        self.assertEqual(user.email, 'pharmacist@test.com')
        self.assertTrue(user.is_pharmacist)

    def test_pharmacy_registration(self):
        """Test pharmacy registration for authenticated pharmacist"""
        # First create and authenticate a user
        user_data = {
            'username': 'testpharmacist',
            'email': 'pharmacist@test.com',
            'password': 'testpass123',
            'is_pharmacist': True
        }
        user = User.objects.create_user(**user_data)
        self.client.force_authenticate(user=user)
        
        response = self.client.post(self.register_pharmacy_url, self.pharmacy_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Pharmacy.objects.filter(name='Test Pharmacy').exists())
        
        # Check that pharmacy is linked to the user
        pharmacy = Pharmacy.objects.get(name='Test Pharmacy')
        self.assertEqual(pharmacy.pharmacist, user)

    def test_user_login(self):
        """Test user login and JWT token generation"""
        # Create a user first
        user_data = {
            'username': 'testpharmacist',
            'email': 'pharmacist@test.com',
            'password': 'testpass123',
            'is_pharmacist': True
        }
        user = User.objects.create_user(**user_data)
        
        login_data = {
            'username': 'testpharmacist',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_pharmacy_registration_requires_authentication(self):
        """Test that pharmacy registration requires authentication"""
        response = self.client.post(self.register_pharmacy_url, self.pharmacy_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_pharmacy_prevention(self):
        """Test that a pharmacist cannot create multiple pharmacies"""
        user_data = {
            'username': 'testpharmacist',
            'email': 'pharmacist@test.com',
            'password': 'testpass123',
            'is_pharmacist': True
        }
        user = User.objects.create_user(**user_data)
        self.client.force_authenticate(user=user)
        
        # Create first pharmacy
        response1 = self.client.post(self.register_pharmacy_url, self.pharmacy_data)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Attempt to create second pharmacy
        pharmacy_data_2 = {
            'name': 'Second Pharmacy',
            'address': '456 Another Street',
            'phone': '+987654321'
        }
        response2 = self.client.post(self.register_pharmacy_url, pharmacy_data_2)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)


class UserModelTestCase(TestCase):
    """Test the custom PharmacyUser model"""
    
    def test_create_user(self):
        """Test creating a basic user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))

    def test_user_type_methods(self):
        """Test user type identification methods"""
        pharmacist = User.objects.create_user(
            username='pharmacist',
            email='pharmacist@test.com',
            password='test123',
            is_pharmacist=True
        )
        
        manager = User.objects.create_user(
            username='manager',
            email='manager@test.com',
            password='test123',
            is_manager=True
        )
        
        customer = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            password='test123',
            is_customer=True
        )
        
        self.assertEqual(pharmacist.get_user_type(), 'Pharmacist')
        self.assertEqual(manager.get_user_type(), 'Manager')
        self.assertEqual(customer.get_user_type(), 'Customer')

    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123',
            is_pharmacist=True
        )
        expected_string = "testuser (Pharmacist)"
        self.assertEqual(str(user), expected_string)
