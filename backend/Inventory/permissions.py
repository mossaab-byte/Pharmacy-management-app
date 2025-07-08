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

        # Adjust these checks based on your user model fields and roles
        is_pharmacist = getattr(user, 'is_pharmacist', False)
        is_manager = getattr(user, 'is_manager', False)
        can_manage = getattr(user, 'can_manage_inventory', False)

        if (is_pharmacist or is_manager) and can_manage:
            return True

        return False
