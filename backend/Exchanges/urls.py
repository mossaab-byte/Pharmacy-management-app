from django.urls import path
from .views import (
    ExchangeCreateView,
    ExchangeListView,
    ExchangeProcessView,
    ExchangeBalanceView,
    ExchangeHistoryView,
    PartnerPharmacyListView,
    ExchangeActionView
)

urlpatterns = [
    path('create/', ExchangeCreateView.as_view(), name='exchange-create'),
    path('list/', ExchangeListView.as_view(), name='exchange-list'),
    path('<uuid:pk>/process/', ExchangeProcessView.as_view(), name='exchange-process'),
    path('balance/', ExchangeBalanceView.as_view(), name='exchange-balance'),
    path('history/<uuid:pharmacy_id>/', ExchangeHistoryView.as_view(), name='exchange-history'),
    path('partners/', PartnerPharmacyListView.as_view(), name='partner-list'),
    path('<uuid:pk>/action/<str:action>/', ExchangeActionView.as_view(), name='exchange-action'),
]