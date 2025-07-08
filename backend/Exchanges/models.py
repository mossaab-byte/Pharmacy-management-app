from django.conf import settings
from django.db import models, transaction
import uuid
from Pharmacy.models import Pharmacy, PharmacyMedicine

class Exchange(models.Model):
    DIRECTION_CHOICES = [('IN', 'Incoming'), ('OUT', 'Outgoing')]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    direction = models.CharField(max_length=3, choices=DIRECTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    payment_type = models.CharField(max_length=20, blank=True)
    source_pharmacy = models.ForeignKey(
        Pharmacy, related_name='source_exchanges', on_delete=models.CASCADE
    )
    dest_pharmacy = models.ForeignKey(
        Pharmacy, related_name='destination_exchanges', on_delete=models.CASCADE
    )
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    @property
    def calculate_total(self):
        return sum(item.total_price for item in self.items.all())

    def update_total(self):
        self.total = self.calculate_total
        self.save()
        # New approval method
    def approve(self, user=None):
        if self.status != 'PENDING':
            return False
        self.status = 'APPROVED'
        if user:
            self.user = user
        self.save()
        return True
    
    # New rejection method
    def reject(self, reason, user=None):
        if self.status != 'PENDING':
            return False
        self.status = 'REJECTED'
        self.notes = reason
        if user:
            self.user = user
        self.save()
        return True

    def process(self, user=None):
        if self.completed:
            return False
        self.update_total()
        with transaction.atomic():
            for item in self.items.all():
                # OUT from source
                pm_source = PharmacyMedicine.objects.get(
                    pharmacy=self.source_pharmacy,
                    medicine=item.medicine
                )
                pm_source.reduce_stock(
                    amount=item.quantity,
                    user=user,
                    reason='TRANSFER_OUT',
                    reference_transaction=self
                )
                # IN to destination
                pm_dest, created = PharmacyMedicine.objects.get_or_create(
                    pharmacy=self.dest_pharmacy,
                    medicine=item.medicine,
                    defaults={'cost_price': pm_source.cost_price}
                )
                pm_dest.add_stock(
                    amount=item.quantity,
                    user=user,
                    reason='TRANSFER_IN',
                    reference_transaction=self
                )
            self.completed = True
            if user:
                self.user = user
            self.save()
        return True

    def reverse(self, user=None):
        if not self.completed:
            return False
        with transaction.atomic():
            for item in self.items.all():
                # Reverse IN to source
                pm_source = PharmacyMedicine.objects.get(
                    pharmacy=self.source_pharmacy,
                    medicine=item.medicine
                )
                pm_source.add_stock(
                    amount=item.quantity,
                    user=user,
                    reason='TRANSFER_IN',
                    reference_transaction=self
                )
                # Reverse OUT from destination
                pm_dest = PharmacyMedicine.objects.get(
                    pharmacy=self.dest_pharmacy,
                    medicine=item.medicine
                )
                pm_dest.reduce_stock(
                    amount=item.quantity,
                    user=user,
                    reason='TRANSFER_OUT',
                    reference_transaction=self
                )
            self.completed = False
            if user:
                self.user = user
            self.save()
        return True

class ExchangeItem(models.Model):
    exchange = models.ForeignKey(
        Exchange, on_delete=models.CASCADE, related_name='items'
    )
    medicine = models.ForeignKey(
        'Medicine.Medicine', on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()

    @property
    def total_price(self):
        # Use the correct field name for medicine price
        return self.quantity * (self.medicine.ppv or 0)

    def __str__(self):
        return f"{self.quantity} x {self.medicine.nom}"
