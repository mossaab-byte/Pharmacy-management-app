from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy, PharmacyMedicine, Manager
from Sales.models import Sale, Customer, Payment
from Purchases.models import Purchase, Supplier
from Exchanges.models import Exchange
from Medicine.models import Medicine
from django.db import connection

User = get_user_model()

class HealthCheckView(APIView):
    """
    API endpoint to check the health of the system
    """
    permission_classes = []

    def get(self, request):
        health_data = {
            'status': 'healthy',
            'database': 'connected',
            'version': '1.0.0',
            'timestamp': None
        }
        
        try:
            # Test database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
                
            # Get basic counts
            health_data.update({
                'statistics': {
                    'users': User.objects.count(),
                    'pharmacies': Pharmacy.objects.count(),
                    'medicines': Medicine.objects.count(),
                    'sales': Sale.objects.count(),
                    'purchases': Purchase.objects.count(),
                    'exchanges': Exchange.objects.count(),
                    'customers': Customer.objects.count(),
                    'suppliers': Supplier.objects.count(),
                }
            })
            
        except Exception as e:
            health_data.update({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e)
            })
            return Response(health_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        return Response(health_data, status=status.HTTP_200_OK)

class APIInfoView(APIView):
    """
    API endpoint information
    """
    permission_classes = []

    def get(self, request):
        api_info = {
            'name': 'Pharmacy Management System API',
            'version': '1.0.0',
            'endpoints': {
                'authentication': {
                    'register_user': '/api/register-user/',
                    'register_pharmacy': '/api/pharmacies/register/',
                    'login': '/api/token/',
                    'refresh': '/api/token/refresh/',
                    'current_user': '/api/auth/me/',
                    'logout': '/api/auth/logout/',
                    'change_password': '/api/auth/change-password/',
                },
                'pharmacy': {
                    'list': '/api/pharmacy/',
                    'medicines': '/api/pharmacy/medicines/',
                    'managers': '/api/pharmacy/managers/',
                },
                'sales': {
                    'list': '/api/sales/sales/',
                    'customers': '/api/sales/customers/',
                    'payments': '/api/sales/payments/',
                    'pharmacy_sales': '/api/sales/pharmacy/sales/',
                },
                'inventory': {
                    'list': '/api/inventory/',
                    'logs': '/api/inventory/logs/',
                },
                'purchases': {
                    'list': '/api/purchases/',
                    'suppliers': '/api/purchases/suppliers/',
                },
                'exchanges': {
                    'list': '/api/exchange/',
                },
                'medicines': {
                    'list': '/api/medicine/',
                },
                'dashboard': {
                    'stats': '/api/dashboard/',
                }
            }
        }
        return Response(api_info, status=status.HTTP_200_OK)
