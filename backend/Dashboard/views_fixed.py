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


class KpisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from Sales.models import Sale, Customer
        from Pharmacy.models import PharmacyMedicine
        from Purchases.models import Purchase
        from django.db.models.functions import TruncMonth
        from django.db.models import Sum
        import datetime
        
        try:
            # Get user's pharmacy
            pharmacy = request.user.pharmacy
            
            # Monthly sales totals - FILTERED BY PHARMACY
            sales_monthly = (
                Sale.objects
                .filter(pharmacy=pharmacy)
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(total=Sum('total_amount'))
                .order_by('month')
            )
            
            # Monthly purchases totals - FILTERED BY PHARMACY
            purchases_monthly = (
                Purchase.objects
                .filter(pharmacy=pharmacy)
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(total=Sum('total_amount'))
                .order_by('month')
            )
            
            # Static KPIs - ALL FILTERED BY PHARMACY
            total_customers = Customer.objects.filter(pharmacy=pharmacy).count()
            total_sales = Sale.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('total_amount'))['total'] or 0
            total_purchases = Purchase.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('total_amount'))['total'] or 0
            total_medicines = PharmacyMedicine.objects.filter(pharmacy=pharmacy).aggregate(total=Sum('quantity'))['total'] or 0
            
            # Compose response
            data = {
                "salesMonthly": list(sales_monthly),
                "purchasesMonthly": list(purchases_monthly),
                "totalCustomers": total_customers,
                "totalMedicines": total_medicines,
                "totalSales": float(total_sales),
                "totalPurchases": float(total_purchases),
            }
            return Response(data)
        except Exception as e:
            print(f"Error in KpisView: {e}")
            return Response({"error": str(e)}, status=500)


class TopProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pharmacy = request.user.pharmacy
            top_products = (
                SaleItem.objects
                .filter(sale__pharmacy=pharmacy)
                .values('medicine__name')
                .annotate(
                    total_sales=Sum('quantity'),
                    total_revenue=Sum(F('quantity') * F('price'))
                )
                .order_by('-total_revenue')[:5]
            )
            
            products_data = []
            for product in top_products:
                products_data.append({
                    "name": product['medicine__name'],
                    "sales": product['total_sales'],
                    "revenue": float(product['total_revenue'])
                })
            
            return Response(products_data)
        except Exception as e:
            print(f"Error in TopProductsView: {e}")
            return Response([], status=200)


class RevenueTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pharmacy = request.user.pharmacy
            from datetime import datetime, timedelta
            from django.db.models.functions import TruncDate
            
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            revenue_trend = (
                Sale.objects
                .filter(pharmacy=pharmacy, created_at__gte=thirty_days_ago)
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(revenue=Sum('total_amount'))
                .order_by('date')
            )
            
            trend_data = []
            for trend in revenue_trend:
                trend_data.append({
                    "date": trend['date'].strftime('%Y-%m-%d'),
                    "revenue": float(trend['revenue'])
                })
            
            return Response(trend_data)
        except Exception as e:
            print(f"Error in RevenueTrendView: {e}")
            return Response([], status=200)


class SalesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pharmacy = request.user.pharmacy
            recent_sales = (
                Sale.objects
                .filter(pharmacy=pharmacy)
                .select_related('customer')
                .order_by('-created_at')[:10]
            )
            
            sales_data = []
            for sale in recent_sales:
                sales_data.append({
                    "id": sale.id,
                    "date": sale.created_at.strftime('%Y-%m-%d'),
                    "total": float(sale.total_amount),
                    "customer": sale.customer.name if sale.customer else "Walk-in Customer"
                })
            
            return Response(sales_data)
        except Exception as e:
            print(f"Error in SalesView: {e}")
            return Response([], status=200)


class InventoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            pharmacy = request.user.pharmacy
            inventory_items = (
                PharmacyMedicine.objects
                .filter(pharmacy=pharmacy)
                .select_related('medicine')
                .order_by('medicine__name')[:10]
            )
            
            inventory_data = []
            for item in inventory_items:
                min_stock = getattr(item, 'min_stock_level', 50)
                status = "OK" if item.quantity >= min_stock else "LOW"
                
                inventory_data.append({
                    "medicine": item.medicine.name,
                    "quantity": item.quantity,
                    "min_stock": min_stock,
                    "status": status
                })
            
            return Response(inventory_data)
        except Exception as e:
            print(f"Error in InventoryView: {e}")
            return Response([], status=200)
