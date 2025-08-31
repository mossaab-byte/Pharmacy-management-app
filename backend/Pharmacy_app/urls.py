from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Add the 'api/' prefix here:
    path('api/', include('Authentification.urls')),
    path('api/pharmacy/', include('Pharmacy.urls')),
    path('api/medicine/', include('Medicine.urls')),
    path('api/sales/', include('Sales.urls')),
    path('api/purchases/', include('Purchases.urls')),
    path('api/exchange/', include('Exchanges.urls')),
    path('api/inventory/', include('Inventory.urls')),
    path('api/dashboard/', include('Dashboard.urls')),
    path('api/utils/', include('utils.urls')),
    path('api/employee/', include('Employee.urls')),
    path('', include('Finance.urls')),  # Finance URLs already include api/finance/ prefix
]
