from django.urls import path
from .views import HealthCheckView, APIInfoView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('info/', APIInfoView.as_view(), name='api-info'),
]
