from django.conf import settings
from django.db import models
import uuid
from Pharmacy.models import PharmacyMedicine
from django.db import transaction
from django.utils import timezone

class Customer(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        user = models.OneToOneField(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE
        )
        phone = models.CharField(max_length=20, blank=True)
        address = models.TextField(blank=True)
        @property
        def balance(self):
            total_sales = Sale.objects.filter(customer=self).aggregate(
                total=models.Sum('total_amount')
            )['total'] or 0
            
            total_payments = Payment.objects.filter(sale__customer=self).aggregate(
                total=models.Sum('amount')
            )['total'] or 0
            
            return total_sales - total_payments

        def __str__(self):
            return str(self.user)

class Sale(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE )
        customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
        total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
        units_sold = models.PositiveIntegerField(default=0)  # Fixed: removed max_length
        created_at = models.DateTimeField(auto_now_add=True)
        served_by = models.ForeignKey(
            settings.AUTH_USER_MODEL,
            on_delete=models.SET_NULL,
            null=True,
            related_name='sales_served'
        )
        

        def __str__(self):
            return f"Sale {self.id}"



        def finalize(self):
            with transaction.atomic():
                self.total_amount = sum(item.subtotal for item in self.items.all())
                self.save()
                for item in self.items.all():
                    pm = item.pharmacy_medicine
                    pm.reduce_stock(
                        amount=item.quantity,
                        user=self.served_by,
                        reason='SALE',
                        reference_transaction=self
                    )


class SaleItem(models.Model):
        sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
        pharmacy_medicine = models.ForeignKey(PharmacyMedicine, on_delete=models.CASCADE)
        quantity = models.PositiveIntegerField()
        unit_price = models.DecimalField(max_digits=10, decimal_places=2)
        subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)  

        def save(self, *args, **kwargs):
            self.subtotal = self.quantity * self.unit_price
            super().save(*args, **kwargs)

class Payment(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
        amount = models.DecimalField(max_digits=10, decimal_places=2)
        created_at = models.DateTimeField(default=timezone.now)
        method = models.CharField(max_length=50,null=True)

        def __str__(self):
            return f"Payment {self.id} for {self.sale.id}"