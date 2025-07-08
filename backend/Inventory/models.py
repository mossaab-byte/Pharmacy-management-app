from django.conf import settings
from django.db import models
import uuid
from Pharmacy.models import *

class InventoryLog(models.Model):
    TRANSACTION_TYPES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('ADJUSTMENT', 'Manual Adjustment'),
    ]
    REASON_CHOICES = [
        ('SALE', 'Sale'),
        ('PURCHASE', 'Purchase'),
        ('TRANSFER_IN', 'Transfer In'),
        ('TRANSFER_OUT', 'Transfer Out'),
        ('EXPIRED', 'Expired'),
        ('DAMAGED', 'Damaged'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey(
        PharmacyMedicine,
        on_delete=models.CASCADE,
        related_name='inventory_logs'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity_changed = models.PositiveIntegerField()
    old_quantity = models.PositiveIntegerField()
    new_quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    reference_sale = models.ForeignKey(
        'Sales.Sale',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='inventory_logs'
    )
    reference_purchase = models.ForeignKey(
        'Purchases.Purchase',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='inventory_logs'
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.pharmacy_medicine} - {self.transaction_type} ({self.quantity_changed})"