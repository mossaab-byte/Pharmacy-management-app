from rest_framework import permissions

class CanModifyPurchases(permissions.BasePermission):
    """
    Allows access only to users with can_modify_purchases = True in ManagerPermission for their pharmacy.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        # Allow any user with is_pharmacist=True (basic pharmacist access)
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            return True

        # Pharmacists (owners) are allowed by default
        if hasattr(user, 'owned_pharmacy'):
            return True

        # Check manager permissions
        if hasattr(user, 'custom_permissions'):
            # Filter ManagerPermission for user's pharmacy
            perms = user.custom_permissions.filter(pharmacy=user.pharmacy)
            return perms.filter(can_modify_purchases=True).exists()
        return False

class CanManageSupplier(permissions.BasePermission):
    
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        # Allow any user with is_pharmacist=True (basic pharmacist access)
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            return True

        # Pharmacists (owners) are allowed by default
        if hasattr(user, 'owned_pharmacy'):
            return True

        # Check manager permissions
        if hasattr(user, 'custom_permissions'):
            # Filter ManagerPermission for user's pharmacy
            perms = user.custom_permissions.filter(pharmacy=user.pharmacy)
            return perms.filter(can_manage_suppliers=True).exists()
        return False

class CanDeletePurchases(permissions.BasePermission):
    """
    Allows delete only to users with can_delete_purchases = True in ManagerPermission for their pharmacy.
    """

    def has_permission(self, request, view):
        # Only DELETE requests use this permission.
        if request.method != 'DELETE':
            return True
        user = request.user
        if not user.is_authenticated:
            return False

        # Allow any user with is_pharmacist=True (basic pharmacist access)
        if hasattr(user, 'is_pharmacist') and user.is_pharmacist:
            return True

        if hasattr(user, 'owned_pharmacy'):
            return True

        if hasattr(user, 'custom_permissions'):
            perms = user.custom_permissions.filter(pharmacy=user.pharmacy)
            return perms.filter(can_delete_purchases=True).exists()
        return False
