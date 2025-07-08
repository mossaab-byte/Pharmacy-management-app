from rest_framework.permissions import BasePermission

from rest_framework import permissions


class IsPharmacistOrManager(permissions.BasePermission):
    """
    Allow access if user is pharmacist (owner) or a manager with permissions.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Pharmacist owns the pharmacy
        if hasattr(user, 'pharmacy') and user.pharmacy and hasattr(user.pharmacy, 'pharmacist') and user.pharmacy.pharmacist == user:
            return True

        # Managers with any sales-related permission on the pharmacy
        from Pharmacy.models import Manager
        if hasattr(user, 'pharmacy') and user.pharmacy:
            perms = Manager.objects.filter(user=user, pharmacy=user.pharmacy).first()
            if perms and (perms.can_modify_sales or perms.can_delete_sales):
                return True

        return False


class CanModifySales(permissions.BasePermission):
    """
    Allow modification (create/update) of sales only if user has can_modify_sales.
    Pharmacist has all rights by default.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Pharmacist can always modify
        if hasattr(user, 'pharmacy') and user.pharmacy and hasattr(user.pharmacy, 'pharmacist') and user.pharmacy.pharmacist == user:
            return True

        # Check manager permissions for modifying sales
        from Pharmacy.models import Manager
        if hasattr(user, 'pharmacy') and user.pharmacy:
            perms = Manager.objects.filter(user=user, pharmacy=user.pharmacy).first()
            if perms and perms.can_modify_sales:
                return True

        return False


class CanDeleteSales(permissions.BasePermission):
    """
    Allow deletion of sales only if user has can_delete_sales.
    Pharmacist has all rights by default.
    """

    def has_permission(self, request, view):
        # Safe methods (GET, HEAD, OPTIONS) allowed for everyone who can view
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Pharmacist can always delete
        if hasattr(user, 'pharmacy') and user.pharmacy and hasattr(user.pharmacy, 'pharmacist') and user.pharmacy.pharmacist == user:
            return True

        # Check manager permissions for deleting sales
        from Pharmacy.models import Manager
        if hasattr(user, 'pharmacy') and user.pharmacy:
            perms = Manager.objects.filter(user=user, pharmacy=user.pharmacy).first()
            if perms and perms.can_delete_sales:
                return True

        return False




class CanManageCustomers(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # Pharmacist always allowed
        if getattr(user, 'is_pharmacist', False):
            return True

        # Manager: check custom permission flag
        if getattr(user, 'is_manager', False):
            from Pharmacy.models import Manager
            # Check if the user has permission for this pharmacy
            return Manager.objects.filter(
                user=user,
                pharmacy=user.pharmacy,
                can_manage_customers=True
            ).exists()

        return False
