from rest_framework import permissions



class IsPharmacistAndOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        # Basic check for pharmacist role on all requests to the view
        return request.user.is_authenticated and getattr(request.user, 'is_pharmacist', False)

    def has_object_permission(self, request, view, obj):
        # Check user owns the exchange and is pharmacist
        return obj.user == request.user and getattr(request.user, 'is_pharmacist', False)
