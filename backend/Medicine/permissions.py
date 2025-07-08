from rest_framework import permissions
class IsAdminOnly(permissions.BasePermission):
    """
    Admins can modify global medicines, others read-only
    Pharmacists/managers get their permissions in PHARMACY app only
    """
    def has_permission(self, request, view):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions ONLY for superusers
        return request.user.is_authenticated and request.user.is_superuser