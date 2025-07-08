from django.conf import settings
from django.db import models
import uuid
from Pharmacy.models import PharmacyMedicine
from Medicine.models import Medicine
from django.db import transaction
import uuid
from django.db import models

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    tax_id = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    drug_license = models.CharField(max_length=100, blank=True)
    certification = models.CharField(max_length=100, blank=True)

    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=100, blank=True)
    delivery_schedule = models.CharField(max_length=100, blank=True)
    minimum_order = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)


    notes = models.TextField(blank=True)
    def update_balance(self):
        balance = 0
        transactions = self.transactions.order_by('date', 'id')
        for tx in transactions:
            if tx.type == 'purchase':
                balance += tx.amount
            elif tx.type == 'payment':
                balance -= tx.amount
            elif tx.type == 'reset':
                balance = tx.amount
            tx.running_balance = balance
            tx.save()
        self.current_balance = balance
        self.save()



    def __str__(self):
        return self.name


class Purchase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"Purchase {self.id}"



    def finalize(self):
        with transaction.atomic():
            # 1. Calculate total and save purchase
            self.total_amount = sum(item.subtotal for item in self.items.all())
            self.save()

            # 2. Update inventory
            for item in self.items.all():
                pm, created = PharmacyMedicine.objects.get_or_create(
                    pharmacy=self.pharmacy,
                    medicine=item.medicine,
                    defaults={'cost_price': item.unit_cost, 'quantity': 0}
                )
                pm.add_stock(
                    amount=item.quantity,
                    user=self.received_by,
                    reason='PURCHASE',
                    reference_transaction=self
                )

            # 3. Create SupplierTransaction for the purchase
            SupplierTransaction.objects.create(
                supplier=self.supplier,
                pharmacy=self.pharmacy,
                type='purchase',
                amount=self.total_amount,
                reference=str(self.id),
                created_by=self.received_by,
            )

            # 4. Update the supplier's current balance
            self.supplier.update_balance()


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expiry_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        # Calculate subtotal before saving
        self.subtotal = self.quantity * self.unit_cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.medicine.nom} (Batch {self.batch_number or 'N/A'})"
class SupplierTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('purchase', 'Purchase'),
        ('payment', 'Payment'),
        ('reset', 'Reset'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='transactions')
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    running_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
