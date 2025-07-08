# Authentication/permissions.py (UPDATED)

from rest_framework import permissions
from Pharmacy.models import Manager
from django.core.exceptions import PermissionDenied


class IsAdminOrPharmacistOnly(permissions.BasePermission):
    """
    Only admins (superusers) and pharmacists can perform actions
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Allow if user is admin (superuser) or pharmacist
        return request.user.is_superuser or request.user.is_pharmacist

class IsAdminOrPharmacistOrReadOnly(permissions.BasePermission):
    """
    Admins and pharmacists can do everything, others read-only
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Only admins and pharmacists can modify
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.is_pharmacist
        )

class IsCustomerOwnerOrPharmacistOrAdmin(permissions.BasePermission):
    """
    Customers can only view their own sales, pharmacists and admins can view all
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admins can access everything
        if request.user.is_superuser:
            return True
            
        # Pharmacists can access everything in their pharmacy
        if request.user.is_pharmacist and obj.pharmacy == request.user.pharmacy:
            return True
        
        # Customers can only access their own sales
        if request.user.is_customer and hasattr(obj, 'customer'):
            return obj.customer.user == request.user
        
        return False

class HasManagerPermission(permissions.BasePermission):
    """
    Check if manager has specific permissions for the action
    Admins and pharmacists have all permissions
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admins have all permissions
        if request.user.is_superuser:
            return True
            
        # Pharmacists have all permissions in their pharmacy
        if hasattr(request.user, 'role') and request.user.role == 'PHARMACIST':
            return True
        
        # Check manager permissions
        if hasattr(request.user, 'role') and request.user.role == 'MANAGER':
            try:
                # Optimized query with select_related
                manager_perm = Manager.objects.select_related('pharmacy').get(
                    user=request.user,
                    pharmacy=request.user.managed_pharmacy  # Use your actual relationship
                )
                
                # Map view actions to permissions
                action_permission_map = {
                    'create': self._check_create_permission,
                    'update': self._check_update_permission,
                    'partial_update': self._check_update_permission,
                    'destroy': self._check_delete_permission,
                }
                
                action = view.action
                permission_check = action_permission_map.get(action)
                
                if permission_check:
                    # Get resource type from view attribute
                    resource_type = getattr(view, 'permission_resource', None)
                    return permission_check(manager_perm, resource_type)
                
                return True  # Allow safe methods (GET, HEAD, OPTIONS)
                
            except Manager.DoesNotExist:
                return False
        
        return False
    
    def _check_create_permission(self, manager_perm, resource_type):
        if resource_type == 'sale':
            return manager_perm.can_modify_sales
        elif resource_type == 'purchase':
            return manager_perm.can_modify_purchases
        return False
    
    def _check_update_permission(self, manager_perm, resource_type):
        if resource_type == 'sale':
            return manager_perm.can_modify_sales
        elif resource_type == 'purchase':
            return manager_perm.can_modify_purchases
        return False
    
    def _check_delete_permission(self, manager_perm, resource_type):
        if resource_type == 'sale':
            return manager_perm.can_delete_sales
        elif resource_type == 'purchase':
            return manager_perm.can_delete_purchases
        return False
