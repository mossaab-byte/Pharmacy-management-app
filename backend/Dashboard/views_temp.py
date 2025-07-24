from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import TruncMonth, Coalesce

from Pharmacy.models import PharmacyMedicine
from Sales.models import Sale, SaleItem
from .serializers import (
    KpiSerializer,
    TopProductSerializer,
    RevenueTrendSerializer,
    SaleSerializer,
    InventorySerializer,
)


class KpisView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def get(self, request):
        # Return dummy data if no pharmacy is available
        pharmacy = getattr(request.user, 'pharmacy', None) if request.user.is_authenticated else None
        
        if not pharmacy:
            # Return dummy data for testing
            data = {
                "totalRevenue": 15000.00,
                "prescriptionsFilled": 150,
                "inventoryValue": 50000.00,
            }
            serializer = KpiSerializer(data)
            return Response(serializer.data)

        total_revenue = Sale.objects.filter(pharmacy=pharmacy).aggregate(
            total=Coalesce(Sum('total_amount'), 0, output_field=DecimalField())
        )['total']

        prescriptions_filled = PharmacyMedicine.objects.filter(
            pharmacy=pharmacy
        ).aggregate(total=Coalesce(Sum('units_sold'), 0))['total']

        inventory_value = PharmacyMedicine.objects.filter(pharmacy=pharmacy).aggregate(
            total=Coalesce(Sum(F('quantity') * F('price')), 0)
        )['total']

        data = {
            "totalRevenue": total_revenue,
            "prescriptionsFilled": prescriptions_filled,
            "inventoryValue": inventory_value,
        }
        serializer = KpiSerializer(data)
        return Response(serializer.data)


class TopProductsView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def get(self, request):
        # Return dummy data for testing
        dummy_data = [
            {"name": "Paracetamol", "sales": 120, "revenue": 240.00},
            {"name": "Ibuprofen", "sales": 95, "revenue": 380.00},
            {"name": "Aspirin", "sales": 80, "revenue": 160.00},
            {"name": "Amoxicillin", "sales": 60, "revenue": 720.00},
            {"name": "Vitamin C", "sales": 50, "revenue": 250.00},
        ]
        return Response(dummy_data)


class RevenueTrendView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def get(self, request):
        # Return dummy data for testing
        dummy_data = [
            {"date": "2025-01-01", "revenue": 1200.00},
            {"date": "2025-01-02", "revenue": 1450.00},
            {"date": "2025-01-03", "revenue": 1100.00},
            {"date": "2025-01-04", "revenue": 1650.00},
            {"date": "2025-01-05", "revenue": 1300.00},
        ]
        return Response(dummy_data)


class SalesView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def get(self, request):
        # Return dummy data for testing
        dummy_data = [
            {"id": 1, "date": "2025-01-17", "total": 50.00, "customer": "John Doe"},
            {"id": 2, "date": "2025-01-17", "total": 25.50, "customer": "Jane Smith"},
            {"id": 3, "date": "2025-01-16", "total": 75.00, "customer": "Bob Johnson"},
        ]
        return Response(dummy_data)


class InventoryView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow any access for testing

    def get(self, request):
        # Return dummy data for testing
        dummy_data = [
            {"medicine": "Paracetamol", "quantity": 500, "min_stock": 100, "status": "OK"},
            {"medicine": "Ibuprofen", "quantity": 50, "min_stock": 75, "status": "LOW"},
            {"medicine": "Aspirin", "quantity": 200, "min_stock": 100, "status": "OK"},
        ]
        return Response(dummy_data)
