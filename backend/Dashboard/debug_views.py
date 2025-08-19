from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from Sales.models import Sale
from Pharmacy.models import Pharmacy


class DebugUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        pharmacy = getattr(user, 'pharmacy', None)
        
        # Get all sales data for debugging
        all_sales = Sale.objects.all()
        all_pharmacies = Pharmacy.objects.all()
        
        # Get sales for this user's pharmacy if they have one
        user_sales = []
        user_sales_total = 0
        if pharmacy:
            user_sales = Sale.objects.filter(pharmacy=pharmacy)
            user_sales_total = user_sales.aggregate(total=Sum('total_amount'))['total'] or 0
        
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "has_pharmacy": hasattr(user, 'pharmacy'),
                "pharmacy": str(pharmacy),
                "pharmacy_id": getattr(pharmacy, 'id', None),
                "pharmacy_name": getattr(pharmacy, 'name', None),
            },
            "sales": {
                "user_pharmacy_sales_count": user_sales.count() if pharmacy else 0,
                "user_pharmacy_sales_total": float(user_sales_total),
                "all_sales_count": all_sales.count(),
                "all_sales_total": float(all_sales.aggregate(total=Sum('total_amount'))['total'] or 0),
            },
            "pharmacies": [
                {
                    "id": p.id,
                    "name": p.name,
                    "sales_count": Sale.objects.filter(pharmacy=p).count(),
                    "sales_total": float(Sale.objects.filter(pharmacy=p).aggregate(total=Sum('total_amount'))['total'] or 0)
                }
                for p in all_pharmacies
            ],
            "all_sales": [
                {
                    "id": s.id,
                    "total_amount": float(s.total_amount),
                    "pharmacy_id": s.pharmacy.id,
                    "pharmacy_name": s.pharmacy.name,
                }
                for s in all_sales
            ]
        })
