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

    # Nouvelles routes pour la gestion des utilisateurs
    path('current-user/', views.current_user, name='current-user'),
    path('users/', views.list_users, name='list-users'),
    path('users/<int:user_id>/toggle-manager/', views.toggle_manager_status, name='toggle-manager'),
    path('users/<int:user_id>/permissions/', views.update_user_permissions, name='update-permissions'),

    path('', include(router.urls)),
]
