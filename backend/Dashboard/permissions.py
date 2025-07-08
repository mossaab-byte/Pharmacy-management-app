from rest_framework.permissions import BasePermission
from Pharmacy.models import Manager

class CanViewReportsPermission(BasePermission):
    """
    Allows access only to pharmacists or managers with can_view_reports=True.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Assume pharmacist status via user attribute; adjust accordingly
        if getattr(user, 'is_pharmacist', False):
            return True

        # Check if user is a manager with can_view_reports=True for their pharmacy
        pharmacy = getattr(user, 'pharmacy', None)
        if not pharmacy:
            return False

        return Manager.objects.filter(
            user=user,
            pharmacy=pharmacy,
            can_view_reports=True
        ).exists()
