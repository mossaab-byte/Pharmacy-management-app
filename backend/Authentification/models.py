from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models
import uuid

class PharmacyUser(AbstractUser, PermissionsMixin):
    """Extended user model with pharmacy-specific fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE, null=True, blank=True)
    is_pharmacist = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type()})"
    
    def get_user_type(self):
        if self.is_pharmacist:
            return "Pharmacist"
        elif self.is_manager:
            return "Manager"
        elif self.is_customer:
            return "Customer"
        return "User"

