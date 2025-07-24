from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
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
from .permissions import CanViewReportsPermission


class KpisView(APIView):
    permission_classes = [IsAuthenticated, CanViewReportsPermission]

    def get(self, request):
        pharmacy = getattr(request.user, 'pharmacy', None)
        if not pharmacy:
            return Response({"detail": "User has no associated pharmacy."}, status=400)

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
    permission_classes = [IsAuthenticated, CanViewReportsPermission]

    def get(self, request):
        pharmacy = getattr(request.user, 'pharmacy', None)
        if not pharmacy:
            return Response({"detail": "User has no associated pharmacy."}, status=400)

        products = (PharmacyMedicine.objects.filter(pharmacy=pharmacy)
                    .values('medicine__nom')
                    .annotate(units_sold=Sum('units_sold'))
                    .order_by('-units_sold')[:10])

        data = [
            {
                "productName": p['medicine__nom'],
                "unitsSold": p['units_sold'],
                
            }
            for p in products
        ]
        serializer = TopProductSerializer(data, many=True)
        return Response(serializer.data)


class RevenueTrendView(APIView):
    permission_classes = [IsAuthenticated, CanViewReportsPermission]

    def get(self, request):
        pharmacy = getattr(request.user, 'pharmacy', None)
        if not pharmacy:
            return Response({"detail": "User has no associated pharmacy."}, status=400)

        monthly_revenue = (Sale.objects.filter(pharmacy=pharmacy)
                           .annotate(month=TruncMonth('created_at'))
                           .values('month')
                           .annotate(amount=Sum('total_amount'))
                           .order_by('month'))

        data = [
            {
                "month": item['month'].strftime('%B %Y'),
                "amount": float(item['amount']),
            }
            for item in monthly_revenue
        ]
        serializer = RevenueTrendSerializer(data, many=True)
        return Response(serializer.data)


class SalesView(APIView):
    permission_classes = [IsAuthenticated, CanViewReportsPermission]

    def get(self, request):
        pharmacy = getattr(request.user, 'pharmacy', None)
        if not pharmacy:
            return Response({"detail": "User has no associated pharmacy."}, status=400)

        sales = Sale.objects.filter(pharmacy=pharmacy).values('created_at', 'total_amount').order_by('created_at')

        data = [
            {
                "date": s['created_at'],
                "total_amount": float(s['total_amount']),
            }
            for s in sales
        ]
        serializer = SaleSerializer(data, many=True)
        return Response(serializer.data)


class InventoryView(APIView):
    permission_classes = [IsAuthenticated, CanViewReportsPermission]

    def get(self, request):
        pharmacy = getattr(request.user, 'pharmacy', None)
        if not pharmacy:
            return Response({"detail": "User has no associated pharmacy."}, status=400)

        top_inventory = (PharmacyMedicine.objects.filter(pharmacy=pharmacy)
                         .select_related('medicine')
                         .order_by('-quantity')[:10])

        data = [
            {
                "medicine_name": item.medicine.nom,
                "stock": item.quantity,
                "minimum_stock_level": item.minimum_stock_level,
                "price": float(item.price or 0),
            }
            for item in top_inventory
        ]
        serializer = InventorySerializer(data, many=True)
        return Response(serializer.data)
