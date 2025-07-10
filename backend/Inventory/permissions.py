from rest_framework.permissions import BasePermission

class CanManageInventoryLogs(BasePermission):
    """
    Allows access only to superusers or users with pharmacist/manager roles
    who have can_manage_inventory permission.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        # Pharmacist has all permissions
        if getattr(user, 'is_pharmacist', False):
            return True

        # Check manager permissions
        if getattr(user, 'is_manager', False) and hasattr(user, 'pharmacy'):
            from Pharmacy.models import Manager
            manager_perms = Manager.objects.filter(
                user=user,
                pharmacy=user.pharmacy,
                can_manage_inventory=True
            ).exists()
            return manager_perms

        return False
