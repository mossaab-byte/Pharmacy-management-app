from rest_framework import permissions
from rest_framework.permissions import BasePermission

from .models import Manager
from utils.permissions import get_manager_permissions

class CanViewReports(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_manager or request.user.is_pharmacist:
            return True
        if request.user.is_manager:
            perms = get_manager_permissions(request.user)
            return perms and perms.can_view_reports
        return False
class IsAdminOrReadOnly(BasePermission):
    """Admin has full access, others read-only"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_manager

class IsAdminOrPharmacistOwner(BasePermission):
    """Admin or pharmacist of the same pharmacy"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_manager or request.user.is_pharmacist
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_manager:
            return True
        
        # For pharmacy-related objects
        if hasattr(obj, 'pharmacy'):
            return obj.pharmacy_id == request.user.pharmacy_id
        elif hasattr(obj, 'pharmacy_id'):
            return obj.pharmacy_id == request.user.pharmacy_id
        
        return False

class CanManageInventory(permissions.BasePermission):
    """
    Allows access only to pharmacists or managers with inventory rights.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.is_pharmacist:
            return True

        if user.is_manager:
            return Manager.objects.filter(
                manager=user,
                pharmacy=user.pharmacy,
                can_manage_inventory=True
            ).exists()

        return False

class CanModifySale(BasePermission):
    """Admin, pharmacist, or manager can modify sales"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_manager or 
            request.user.is_pharmacist or 
            request.user.is_manager
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_manager:
            return True
        if request.user.is_pharmacist or request.user.is_manager:
            return obj.pharmacy_id == request.user.pharmacy_id
        return False

class IsClientOwner(BasePermission):
    """Client can only access their own data"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_client
    
    def has_object_permission(self, request, view, obj):
        # For customer-related objects
        if hasattr(obj, 'customer'):
            return obj.customer.user_id == request.user.id
        return False

class CanViewClientData(BasePermission):
    """Admin, pharmacist of same pharmacy, or client themselves"""
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_manager:
            return True
        
        # If it's a client viewing their own data
        if request.user.is_client:
            if hasattr(obj, 'customer') and obj.customer.user_id == request.user.id:
                return True
            return False
        
        # If it's pharmacist/manager viewing client data from their pharmacy
        if request.user.is_pharmacist or request.user.is_manager:
            if hasattr(obj, 'customer'):
                return obj.customer.pharmacy_id == request.user.pharmacy_id
            elif hasattr(obj, 'pharmacy_id'):
                return obj.pharmacy_id == request.user.pharmacy_id
        
        return False
class CanCreatePharmacy(permissions.BasePermission):
    """Pharmacist can create only one pharmacy"""
    message = "You already own a pharmacy"

    def has_permission(self, request, view):
        if request.method == 'POST':
            # Check if user already has a pharmacy
            return not hasattr(request.user, 'owned_pharmacy')
        return True

class CannotDeletePharmacy(permissions.BasePermission):
    """Pharmacist cannot delete pharmacy"""
    message = "Pharmacists cannot delete pharmacies"

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return request.user.is_superuser
        return True
