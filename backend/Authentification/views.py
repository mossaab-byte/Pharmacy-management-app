# Authentication/views.py
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import *
from Pharmacy.serializers import PharmacySerializer
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.shortcuts import get_object_or_404

User = get_user_model()

class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Si c'est le premier utilisateur d'une pharmacie, il devient automatiquement pharmacien
            if user.pharmacy:
                pharmacy_users_count = User.objects.filter(pharmacy=user.pharmacy).count()
                if pharmacy_users_count == 1:  # Premier utilisateur de cette pharmacie
                    user.is_pharmacist = True
                    user.can_manage_inventory = True
                    user.can_manage_sales = True
                    user.can_manage_purchases = True
                    user.can_manage_users = True
                    user.can_view_reports = True
                    user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'is_pharmacist': user.is_pharmacist,
                    'is_manager': user.is_manager,
                    'is_customer': user.is_customer,
                    'permissions': {
                        'can_manage_inventory': user.can_manage_inventory,
                        'can_manage_sales': user.can_manage_sales,
                        'can_manage_purchases': user.can_manage_purchases,
                        'can_manage_users': user.can_manage_users,
                        'can_view_reports': user.can_view_reports,
                    }
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Registration failed',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class RegisterPharmacyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Pass request context to serializer
            serializer = PharmacyRegisterSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            pharmacy = serializer.save()
            
            return Response({
                "success": True,
                "message": "Pharmacy created successfully",
                "pharmacy": {
                    "id": str(pharmacy.id),
                    "name": pharmacy.name,
                    "address": pharmacy.address,
                    "phone": pharmacy.phone,
                    "created_at": pharmacy.created_at
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Pharmacy registration failed',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_pharmacist': user.is_pharmacist,
            'is_manager': user.is_manager,
            'is_customer': user.is_customer,
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or token not provided"}, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = PharmacyUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show users from the same pharmacy
        if self.request.user.pharmacy:
            return User.objects.filter(pharmacy=self.request.user.pharmacy)
        elif hasattr(self.request.user, 'owned_pharmacy') and self.request.user.owned_pharmacy:
            return User.objects.filter(pharmacy=self.request.user.owned_pharmacy)
        return User.objects.none()

    def perform_create(self, serializer):
        """Create new employee and assign to current user's pharmacy"""
        if not (self.request.user.can_manage_users or self.request.user.is_pharmacist):
            raise PermissionDenied("You don't have permission to create employees")
        
        # Get the pharmacy to assign the new user to
        pharmacy = None
        if self.request.user.pharmacy:
            pharmacy = self.request.user.pharmacy
        elif hasattr(self.request.user, 'owned_pharmacy') and self.request.user.owned_pharmacy:
            pharmacy = self.request.user.owned_pharmacy
        
        if not pharmacy:
            raise ValidationError("No pharmacy found for current user")
        
        # Save the new user with the pharmacy
        user = serializer.save(pharmacy=pharmacy, created_by=self.request.user)
        
        # Set password if provided
        password = self.request.data.get('password')
        if password:
            user.set_password(password)
            user.save()

    @action(detail=True, methods=['patch'], url_path='permissions')
    def update_permissions(self, request, pk=None):
        """Update user permissions"""
        if not request.user.can_manage_users:
            return Response(
                {'error': 'Permission denied. You cannot manage user permissions.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        # Set flag to prevent auto-assignment of permissions
        user._permissions_set_manually = True
        
        # Update permissions
        permissions_data = request.data
        for field in ['can_manage_inventory', 'can_manage_sales', 'can_manage_purchases', 'can_manage_users', 'can_view_reports']:
            if field in permissions_data:
                setattr(user, field, permissions_data[field])
        
        user.save()
        
        return Response({
            'message': 'Permissions updated successfully',
            'permissions': {
                'can_manage_inventory': user.can_manage_inventory,
                'can_manage_sales': user.can_manage_sales,
                'can_manage_purchases': user.can_manage_purchases,
                'can_manage_users': user.can_manage_users,
                'can_view_reports': user.can_view_reports,
            }
        })

    @action(detail=True, methods=['post'], url_path='toggle-manager')
    def toggle_manager(self, request, pk=None):
        """Toggle manager status for a user"""
        if not request.user.can_manage_users:
            return Response(
                {'error': 'Permission denied. You cannot manage users.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_manager = not user.is_manager
        
        # If promoting to manager, give default manager permissions
        if user.is_manager:
            user.can_manage_inventory = True
            user.can_manage_sales = True
            user.can_view_reports = True
        else:
            # If demoting from manager, remove manager permissions
            user.can_manage_inventory = False
            user.can_manage_purchases = False
            user.can_manage_users = False
            user.can_view_reports = False
        
        user.save()
        
        return Response({
            'message': f'User {"promoted to" if user.is_manager else "demoted from"} manager',
            'is_manager': user.is_manager,
            'permissions': {
                'can_manage_inventory': user.can_manage_inventory,
                'can_manage_sales': user.can_manage_sales,
                'can_manage_purchases': user.can_manage_purchases,
                'can_manage_users': user.can_manage_users,
                'can_view_reports': user.can_view_reports,
            }
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Obtenir les informations de l'utilisateur connecté avec ses permissions"""
    user = request.user
    
    # Construire la réponse avec toutes les informations nécessaires
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_pharmacist': getattr(user, 'is_pharmacist', False),
        'is_manager': getattr(user, 'is_manager', False),
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'permissions': {
            'can_manage_inventory': getattr(user, 'can_manage_inventory', False),
            'can_manage_sales': getattr(user, 'can_manage_sales', False),
            'can_manage_purchases': getattr(user, 'can_manage_purchases', False),
            'can_manage_customers': getattr(user, 'can_manage_customers', False),
            'can_view_reports': getattr(user, 'can_view_reports', False),
            'can_manage_users': getattr(user, 'can_manage_users', False),
        }
    }
    
    # Ajouter les informations de pharmacie si disponibles
    if hasattr(user, 'pharmacy') and user.pharmacy:
        user_data['pharmacy'] = {
            'id': user.pharmacy.id,
            'name': user.pharmacy.name,
            'address': user.pharmacy.address,
            'phone': user.pharmacy.phone
        }
    
    return Response(user_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Lister tous les utilisateurs (uniquement pour les managers)"""
    if not getattr(request.user, 'can_manage_users', False) and not request.user.is_staff:
        return Response(
            {'detail': 'Permission denied. Only managers can list users.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Filtrer par pharmacie si l'utilisateur n'est pas admin
    if hasattr(request.user, 'pharmacy') and request.user.pharmacy and not request.user.is_superuser:
        users = User.objects.filter(pharmacy=request.user.pharmacy)
    else:
        users = User.objects.all()
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_pharmacist': getattr(user, 'is_pharmacist', False),
            'is_manager': getattr(user, 'is_manager', False),
            'is_active': user.is_active,
            'permissions': {
                'can_manage_inventory': getattr(user, 'can_manage_inventory', False),
                'can_manage_sales': getattr(user, 'can_manage_sales', False),
                'can_manage_purchases': getattr(user, 'can_manage_purchases', False),
                'can_manage_customers': getattr(user, 'can_manage_customers', False),
                'can_view_reports': getattr(user, 'can_view_reports', False),
                'can_manage_users': getattr(user, 'can_manage_users', False),
            }
        })
    
    return Response(users_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_manager_status(request, user_id):
    """Basculer le statut manager d'un utilisateur"""
    # Seuls les pharmaciens et les managers peuvent modifier les statuts
    if not (getattr(request.user, 'is_pharmacist', False) or getattr(request.user, 'can_manage_users', False)) and not request.user.is_staff:
        return Response(
            {'detail': 'Permission denied. Only pharmacists or managers can toggle manager status.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user = get_object_or_404(User, id=user_id)
    
    # Ne pas permettre à un utilisateur de modifier son propre statut
    if user.id == request.user.id:
        return Response(
            {'detail': 'Cannot modify your own manager status.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Ne pas permettre de modifier le statut d'un pharmacien
    if getattr(user, 'is_pharmacist', False):
        return Response(
            {'detail': 'Cannot modify pharmacist status. Pharmacists have all rights by default.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Basculer le statut manager
    user.is_manager = not getattr(user, 'is_manager', False)
    
    # Si devient manager, activer les permissions de base
    if user.is_manager:
        user.can_manage_inventory = True
        user.can_manage_sales = True
        user.can_manage_purchases = True
        user.can_view_reports = True
        # Les pharmaciens seuls peuvent donner le droit de gérer les utilisateurs
        if getattr(request.user, 'is_pharmacist', False):
            user.can_manage_users = True
    else:
        # Si n'est plus manager, retirer toutes les permissions sauf vente de base
        user.can_manage_inventory = False
        user.can_manage_purchases = False
        user.can_view_reports = False
        user.can_manage_users = False
        user.can_manage_sales = True  # Garder la vente de base
    
    user.save()
    
    return Response({
        'message': f'Manager status {"activated" if user.is_manager else "deactivated"} for {user.username}',
        'is_manager': user.is_manager,
        'permissions': {
            'can_manage_inventory': user.can_manage_inventory,
            'can_manage_sales': user.can_manage_sales,
            'can_manage_purchases': user.can_manage_purchases,
            'can_manage_users': user.can_manage_users,
            'can_view_reports': user.can_view_reports,
        }
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_permissions(request, user_id):
    """Mettre à jour les permissions d'un utilisateur"""
    # Seuls les pharmaciens peuvent modifier les permissions
    if not getattr(request.user, 'is_pharmacist', False) and not request.user.is_staff:
        return Response(
            {'detail': 'Permission denied. Only pharmacists can update permissions.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user = get_object_or_404(User, id=user_id)
    
    # Ne pas permettre de modifier les permissions d'un pharmacien
    if getattr(user, 'is_pharmacist', False):
        return Response(
            {'detail': 'Cannot modify pharmacist permissions. Pharmacists have all rights by default.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    permissions = request.data.get('permissions', {})
    
    # Mettre à jour les permissions (sauf pour les pharmaciens)
    for perm, value in permissions.items():
        if hasattr(user, perm):
            setattr(user, perm, value)
    
    # Marquer que les permissions ont été définies manuellement
    user._permissions_set_manually = True
    user.save()
    
    return Response({
        'message': f'Permissions updated for {user.username}',
        'permissions': {
            'can_manage_inventory': getattr(user, 'can_manage_inventory', False),
            'can_manage_sales': getattr(user, 'can_manage_sales', False),
            'can_manage_purchases': getattr(user, 'can_manage_purchases', False),
            'can_manage_users': getattr(user, 'can_manage_users', False),
            'can_view_reports': getattr(user, 'can_view_reports', False),
        }
    })
