from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid

class CustomerGroup(models.Model):
    """Customer segmentation for targeted marketing"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class LoyaltyProgram(models.Model):
    """Customer loyalty program"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    points_per_dollar = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    redemption_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.01)  # Points to dollar ratio
    min_redemption_points = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class CustomerProfile(models.Model):
    """Extended customer profile"""
    customer = models.OneToOneField('Sales.Customer', on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    insurance_provider = models.CharField(max_length=255, blank=True)
    insurance_number = models.CharField(max_length=100, blank=True)
    medical_conditions = models.TextField(blank=True)
    preferred_language = models.CharField(max_length=50, default='English')
    
    # Loyalty program
    loyalty_program = models.ForeignKey(LoyaltyProgram, on_delete=models.SET_NULL, null=True, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)
    customer_group = models.ForeignKey(CustomerGroup, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    marketing_emails = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def add_loyalty_points(self, purchase_amount):
        """Add loyalty points based on purchase"""
        if self.loyalty_program:
            points = int(purchase_amount * self.loyalty_program.points_per_dollar)
            self.loyalty_points += points
            self.save()
            return points
        return 0
    
    def redeem_points(self, points):
        """Redeem loyalty points for discount"""
        if self.loyalty_points >= points and points >= self.loyalty_program.min_redemption_points:
            discount = points * self.loyalty_program.redemption_rate
            self.loyalty_points -= points
            self.save()
            return discount
        return 0
    
    def __str__(self):
        return f"{self.customer} Profile"

class SalesTarget(models.Model):
    """Sales targets for staff"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    target_period = models.CharField(max_length=20, choices=[
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ])
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    achieved_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    @property
    def achievement_percentage(self):
        if self.target_amount > 0:
            return (self.achieved_amount / self.target_amount) * 100
        return 0
    
    def __str__(self):
        return f"{self.staff_member} - {self.target_period} Target"

class Discount(models.Model):
    """Flexible discount system"""
    DISCOUNT_TYPES = [
        ('PERCENTAGE', 'Percentage'),
        ('FIXED_AMOUNT', 'Fixed Amount'),
        ('BUY_X_GET_Y', 'Buy X Get Y'),
        ('BULK', 'Bulk Discount'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)  # Percentage or amount
    min_quantity = models.PositiveIntegerField(default=1)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    
    # Applicability
    applicable_medicines = models.ManyToManyField('Medicine.Medicine', blank=True)
    applicable_categories = models.ManyToManyField('Medicine.DrugCategory', blank=True)
    applicable_customer_groups = models.ManyToManyField(CustomerGroup, blank=True)
    
    # Validity
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        """Check if discount is currently valid"""
        now = timezone.now()
        return (self.is_active and 
                self.start_date <= now <= self.end_date and
                (self.max_uses is None or self.used_count < self.max_uses))
    
    def __str__(self):
        return self.name

class SaleReturn(models.Model):
    """Handle sale returns"""
    RETURN_REASONS = [
        ('DEFECTIVE', 'Defective Product'),
        ('WRONG_MEDICINE', 'Wrong Medicine'),
        ('CUSTOMER_CHANGE', 'Customer Changed Mind'),
        ('DOCTOR_CHANGE', 'Doctor Changed Prescription'),
        ('SIDE_EFFECTS', 'Side Effects'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_sale = models.ForeignKey('Sales.Sale', on_delete=models.CASCADE, related_name='returns')
    return_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=20, choices=RETURN_REASONS)
    notes = models.TextField(blank=True)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Return for Sale {self.original_sale.id}"

class SaleReturnItem(models.Model):
    """Individual items being returned"""
    sale_return = models.ForeignKey(SaleReturn, on_delete=models.CASCADE, related_name='items')
    sale_item = models.ForeignKey('Sales.SaleItem', on_delete=models.CASCADE)
    quantity_returned = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=[
        ('GOOD', 'Good Condition'),
        ('DAMAGED', 'Damaged'),
        ('EXPIRED', 'Expired'),
    ], default='GOOD')
    
    def __str__(self):
        return f"Return: {self.quantity_returned} x {self.sale_item.pharmacy_medicine.medicine.nom}"

class CustomerVisit(models.Model):
    """Track customer visits for analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey('Sales.Customer', on_delete=models.CASCADE, related_name='visits')
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    visit_date = models.DateTimeField(auto_now_add=True)
    purpose = models.CharField(max_length=20, choices=[
        ('PURCHASE', 'Purchase'),
        ('CONSULTATION', 'Consultation'),
        ('PRESCRIPTION', 'Prescription'),
        ('INQUIRY', 'Inquiry'),
        ('RETURN', 'Return'),
    ])
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.customer} visit on {self.visit_date.date()}"

class CrossSelling(models.Model):
    """Cross-selling suggestions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    primary_medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='cross_sell_primary')
    suggested_medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='cross_sell_suggested')
    relevance_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # 0-1 score
    reason = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['primary_medicine', 'suggested_medicine']
    
    def __str__(self):
        return f"{self.primary_medicine.nom} → {self.suggested_medicine.nom}"

class SalesCommission(models.Model):
    """Staff sales commission tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sale = models.ForeignKey('Sales.Sale', on_delete=models.CASCADE)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Commission: {self.staff_member} - ${self.commission_amount}"
