from Pharmacy.models import Manager

def get_manager_permissions(user):
    """
    Return the manager's permission object for their current pharmacy.
    Assumes a manager can have only one permission per pharmacy (enforced by unique_together).
    """
    if not user.is_authenticated or not user.is_manager or not user.pharmacy:
        return None
    try:
        return Manager.objects.get(manager=user, pharmacy=user.pharmacy)
    except Manager.DoesNotExist:
        return None