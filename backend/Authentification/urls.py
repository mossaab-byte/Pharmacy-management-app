# Authentication/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user')

urlpatterns = [
    path('register-user/', views.RegisterUserView.as_view(), name='register-user'),
    path('pharmacies/register/', views.RegisterPharmacyView.as_view(), name='register-pharmacy'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.MyTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # Current user endpoint (function-based view)
    path('current-user/', views.current_user, name='current-user'),

    # Include router URLs for UserManagementViewSet
    path('', include(router.urls)),
]
