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
        credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        is_active = models.BooleanField(default=True)
        notes = models.TextField(blank=True, help_text="Internal notes about this customer")
        
        class Meta:
            ordering = ['-created_at']
            indexes = [
                models.Index(fields=['phone']),
                models.Index(fields=['created_at']),
                models.Index(fields=['is_active']),
            ]
        
        @property
        def balance(self):
            """Calculate customer's current outstanding balance"""
            from decimal import Decimal
            total_sales = Sale.objects.filter(customer=self).aggregate(
                total=models.Sum('total_amount')
            )['total'] or Decimal('0.00')
            
            total_payments = Payment.objects.filter(sale__customer=self).aggregate(
                total=models.Sum('amount')
            )['total'] or Decimal('0.00')
            
            return total_sales - total_payments

        @property
        def available_credit(self):
            """Calculate how much credit is still available"""
            return self.credit_limit - self.balance

        @property
        def total_purchases(self):
            """Get total amount of all purchases"""
            from decimal import Decimal
            return Sale.objects.filter(customer=self).aggregate(
                total=models.Sum('total_amount')
            )['total'] or Decimal('0.00')
        
        @property
        def sales_count(self):
            """Get total number of sales for this customer"""
            return Sale.objects.filter(customer=self).count()
        
        @property
        def last_purchase_date(self):
            """Get date of last purchase"""
            last_sale = Sale.objects.filter(customer=self).order_by('-created_at').first()
            return last_sale.created_at if last_sale else None

        def can_buy_on_credit(self, amount):
            """Check if customer can purchase given amount on credit"""
            from decimal import Decimal
            amount_decimal = Decimal(str(amount))
            return (self.balance + amount_decimal) <= self.credit_limit

        def get_payment_history(self):
            """Get all payments made by this customer"""
            return Payment.objects.filter(sale__customer=self).order_by('-created_at')
        
        def get_sales_history(self):
            """Get all sales for this customer"""
            return Sale.objects.filter(customer=self).order_by('-created_at')

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

        @property
        def reference(self):
            """Generate a readable reference for this sale"""
            return f"SALE-{str(self.id)[:8].upper()}"
        
        def calculate_total(self):
            """Calculate and return the total amount for this sale"""
            total = sum(item.subtotal for item in self.items.all())
            return total
        
        def update_totals(self):
            """Update total_amount and units_sold based on current items"""
            self.total_amount = self.calculate_total()
            self.units_sold = sum(item.quantity for item in self.items.all())
            self.save()

        def finalize(self):
            with transaction.atomic():
                self.update_totals()
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
            # Ensure subtotal is calculated whenever a SaleItem is saved
            if self.quantity and self.unit_price:
                self.subtotal = self.quantity * self.unit_price
            super().save(*args, **kwargs)
            
            # Update the sale's total after saving this item
            if self.sale_id:
                self.sale.update_totals()

class Payment(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
        amount = models.DecimalField(max_digits=10, decimal_places=2)
        created_at = models.DateTimeField(default=timezone.now)
        method = models.CharField(max_length=50,null=True)

        def __str__(self):
            return f"Payment {self.id} for {self.sale.id}"