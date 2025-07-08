from django.conf import settings
from django.db import models
import uuid
from Medicine.models import Medicine
class Pharmacy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    open_hours = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    pharmacist = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_pharmacy',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name

class Manager(models.Model):
    """Custom permissions for managers set by pharmacists"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(  # Renamed from 'manager' to match service payload
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_permissions'
    )
    pharmacy = models.ForeignKey(
        Pharmacy,  # Update app name if needed
        on_delete=models.CASCADE
    )
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='granted_permissions'
    )
    
    # Permission flags (unchanged)
    can_modify_sales = models.BooleanField(default=False)
    can_delete_sales = models.BooleanField(default=False)
    can_modify_purchases = models.BooleanField(default=False)
    can_delete_purchases = models.BooleanField(default=False)
    can_view_reports = models.BooleanField(default=True)
    can_manage_suppliers = models.BooleanField(default=True)
    can_manage_inventory = models.BooleanField(default=False)
    can_manage_customers = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'pharmacy']  # Ensure one permission set per user-pharmacy
        verbose_name = 'Manager Permission'
        verbose_name_plural = 'Manager Permissions'

    def __str__(self):
        return f"Manager permissions for {self.user.username} at {self.pharmacy.name}"


class PharmacyMedicine(models.Model):
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    minimum_stock_level = models.PositiveIntegerField(default=10)
    units_sold = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [('pharmacy', 'medicine')]

    def reduce_stock(self, amount, user=None, reason="SALE", reference_transaction=None):
        # Local import to avoid circular dependencies
        from Inventory.models import InventoryLog
        if self.quantity < amount:
            return False
        old_quantity = self.quantity
        self.quantity -= amount
        self.units_sold +=1
        self.save()
        # Distinguish sale vs return by presence of 'items'
        is_sale = reference_transaction and hasattr(reference_transaction, 'items')
        InventoryLog.objects.create(
            pharmacy_medicine=self,
            transaction_type='OUT',
            quantity_changed=amount,
            old_quantity=old_quantity,
            new_quantity=self.quantity,
            reason=reason,
            performed_by=user,
            reference_sale=reference_transaction if is_sale else None,
            reference_purchase=reference_transaction if not is_sale else None
        )
        return True

    def add_stock(self, amount, user=None, reason="PURCHASE", reference_transaction=None):
        from Inventory.models import InventoryLog
        old_quantity = self.quantity
        self.quantity += amount
        self.save()
        # Distinguish purchase vs sale return
        is_purchase = reference_transaction and not hasattr(reference_transaction, 'items')
        InventoryLog.objects.create(
            pharmacy_medicine=self,
            transaction_type='IN',
            quantity_changed=amount,
            old_quantity=old_quantity,
            new_quantity=self.quantity,
            reason=reason,
            performed_by=user,
            reference_purchase=reference_transaction if is_purchase else None,
            reference_sale=reference_transaction if not is_purchase else None
        )

    def quantity_at(self, date):
        from django.db.models import Sum, F
        logs = self.inventory_logs.filter(timestamp__lte=date).order_by('timestamp')
        first = logs.first()
        if not first:
            return 0
        starting_qty = first.old_quantity
        net = logs.aggregate(net=Sum(F('new_quantity') - F('old_quantity')))['net'] or 0
        return starting_qty + net