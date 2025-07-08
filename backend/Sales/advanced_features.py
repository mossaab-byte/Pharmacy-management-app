# Sales/advanced_features.py - Advanced Sales Management Features
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

class CustomerLoyaltyProgram(models.Model):
    """Customer loyalty program management"""
    PROGRAM_TYPES = [
        ('POINTS', 'Points Based'),
        ('PERCENTAGE', 'Percentage Discount'),
        ('TIERED', 'Tiered Benefits'),
        ('CASHBACK', 'Cashback'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    program_type = models.CharField(max_length=20, choices=PROGRAM_TYPES)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Points configuration
    points_per_dollar = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    points_redemption_value = models.DecimalField(max_digits=5, decimal_places=2, default=0.01)  # $0.01 per point
    
    # Percentage configuration
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Tiered configuration
    tier1_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier1_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tier2_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier2_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tier3_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tier3_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_program_type_display()}"


class CustomerLoyaltyAccount(models.Model):
    """Individual customer loyalty accounts"""
    TIER_LEVELS = [
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.OneToOneField('Sales.Customer', on_delete=models.CASCADE, related_name='loyalty_account')
    program = models.ForeignKey(CustomerLoyaltyProgram, on_delete=models.CASCADE)
    membership_number = models.CharField(max_length=50, unique=True)
    points_balance = models.PositiveIntegerField(default=0)
    lifetime_points_earned = models.PositiveIntegerField(default=0)
    lifetime_spending = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_tier = models.CharField(max_length=20, choices=TIER_LEVELS, default='BRONZE')
    join_date = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    def add_points(self, amount):
        """Add points to customer account"""
        self.points_balance += amount
        self.lifetime_points_earned += amount
        self.last_activity = timezone.now()
        self.save()
    
    def redeem_points(self, amount):
        """Redeem points from customer account"""
        if amount <= self.points_balance:
            self.points_balance -= amount
            self.last_activity = timezone.now()
            self.save()
            return True
        return False
    
    def update_tier(self):
        """Update customer tier based on lifetime spending"""
        if self.lifetime_spending >= self.program.tier3_threshold:
            self.current_tier = 'PLATINUM'
        elif self.lifetime_spending >= self.program.tier2_threshold:
            self.current_tier = 'GOLD'
        elif self.lifetime_spending >= self.program.tier1_threshold:
            self.current_tier = 'SILVER'
        else:
            self.current_tier = 'BRONZE'
        self.save()
    
    def __str__(self):
        return f"{self.customer.user.get_full_name()} - {self.membership_number}"


class Promotion(models.Model):
    """Promotional campaigns"""
    PROMOTION_TYPES = [
        ('DISCOUNT_PERCENTAGE', 'Percentage Discount'),
        ('DISCOUNT_AMOUNT', 'Fixed Amount Discount'),
        ('BUY_X_GET_Y', 'Buy X Get Y'),
        ('BULK_DISCOUNT', 'Bulk Discount'),
        ('COMBO_OFFER', 'Combo Offer'),
        ('FREE_SHIPPING', 'Free Delivery'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    promotion_type = models.CharField(max_length=30, choices=PROMOTION_TYPES)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Discount configuration
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Buy X Get Y configuration
    buy_quantity = models.PositiveIntegerField(default=0)
    get_quantity = models.PositiveIntegerField(default=0)
    
    # Usage limits
    usage_limit_per_customer = models.PositiveIntegerField(null=True, blank=True)
    total_usage_limit = models.PositiveIntegerField(null=True, blank=True)
    current_usage_count = models.PositiveIntegerField(default=0)
    
    # Applicable products
    applicable_medicines = models.ManyToManyField('Medicine.Medicine', blank=True)
    applicable_categories = models.ManyToManyField('Inventory.InventoryCategory', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid_now(self):
        """Check if promotion is currently valid"""
        now = timezone.now()
        return (self.is_active and 
                self.start_date <= now <= self.end_date and
                (self.total_usage_limit is None or self.current_usage_count < self.total_usage_limit))
    
    def can_apply_to_medicine(self, medicine):
        """Check if promotion applies to specific medicine"""
        if self.applicable_medicines.exists():
            return self.applicable_medicines.filter(id=medicine.id).exists()
        return True
    
    def __str__(self):
        return f"{self.name} - {self.get_promotion_type_display()}"


class SalePromotion(models.Model):
    """Track promotions applied to sales"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey('Sales.Sale', on_delete=models.CASCADE, related_name='applied_promotions')
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    applied_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Promotion {self.promotion.name} applied to Sale {self.sale.id}"


class CustomerSegment(models.Model):
    """Customer segmentation for targeted marketing"""
    SEGMENT_TYPES = [
        ('DEMOGRAPHIC', 'Demographic'),
        ('BEHAVIORAL', 'Behavioral'),
        ('GEOGRAPHIC', 'Geographic'),
        ('PSYCHOGRAPHIC', 'Psychographic'),
        ('CUSTOM', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    segment_type = models.CharField(max_length=20, choices=SEGMENT_TYPES)
    criteria = models.JSONField()  # Store segmentation criteria
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_segment_type_display()}"


class CustomerSegmentMembership(models.Model):
    """Track which customers belong to which segments"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey('Sales.Customer', on_delete=models.CASCADE)
    segment = models.ForeignKey(CustomerSegment, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['customer', 'segment']
    
    def __str__(self):
        return f"{self.customer.user.get_full_name()} in {self.segment.name}"


class SalesTarget(models.Model):
    """Sales targets for pharmacies and staff"""
    TARGET_TYPES = [
        ('REVENUE', 'Revenue Target'),
        ('VOLUME', 'Volume Target'),
        ('PROFIT_MARGIN', 'Profit Margin Target'),
        ('CUSTOMER_ACQUISITION', 'Customer Acquisition'),
        ('PRODUCT_MIX', 'Product Mix Target'),
    ]
    
    PERIOD_TYPES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    target_type = models.CharField(max_length=30, choices=TARGET_TYPES)
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES)
    target_value = models.DecimalField(max_digits=15, decimal_places=2)
    achieved_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_achieved = models.BooleanField(default=False)
    
    @property
    def achievement_percentage(self):
        """Calculate achievement percentage"""
        if self.target_value > 0:
            return (self.achieved_value / self.target_value) * 100
        return 0
    
    def __str__(self):
        return f"{self.get_target_type_display()} - {self.period_type}"


class SalesCommission(models.Model):
    """Sales commission tracking"""
    COMMISSION_TYPES = [
        ('PERCENTAGE', 'Percentage of Sale'),
        ('FIXED_AMOUNT', 'Fixed Amount'),
        ('TIERED', 'Tiered Commission'),
        ('PRODUCT_SPECIFIC', 'Product Specific'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sale = models.ForeignKey('Sales.Sale', on_delete=models.CASCADE, related_name='commissions')
    commission_type = models.CharField(max_length=20, choices=COMMISSION_TYPES)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    def mark_as_paid(self, payment_reference=''):
        """Mark commission as paid"""
        self.is_paid = True
        self.paid_at = timezone.now()
        self.payment_reference = payment_reference
        self.save()
    
    def __str__(self):
        return f"Commission: {self.staff_member.get_full_name()} - ${self.commission_amount}"


class ProductRecommendation(models.Model):
    """AI-powered product recommendations"""
    RECOMMENDATION_TYPES = [
        ('CROSS_SELL', 'Cross-sell'),
        ('UP_SELL', 'Up-sell'),
        ('SUBSTITUTE', 'Substitute'),
        ('COMPLEMENTARY', 'Complementary'),
        ('SEASONAL', 'Seasonal'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    primary_medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='recommendations_for')
    recommended_medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='recommended_with')
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, default=0)  # 0-1 scale
    reason = models.TextField()
    times_recommended = models.PositiveIntegerField(default=0)
    times_accepted = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def acceptance_rate(self):
        """Calculate recommendation acceptance rate"""
        if self.times_recommended > 0:
            return (self.times_accepted / self.times_recommended) * 100
        return 0
    
    def record_recommendation(self, accepted=False):
        """Record a recommendation instance"""
        self.times_recommended += 1
        if accepted:
            self.times_accepted += 1
        self.save()
    
    def __str__(self):
        return f"Recommend {self.recommended_medicine.nom} with {self.primary_medicine.nom}"


class SalesAnalytics(models.Model):
    """Aggregated sales analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    date = models.DateField()
    
    # Daily metrics
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_transactions = models.PositiveIntegerField(default=0)
    total_items_sold = models.PositiveIntegerField(default=0)
    average_transaction_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Customer metrics
    new_customers = models.PositiveIntegerField(default=0)
    returning_customers = models.PositiveIntegerField(default=0)
    
    # Profitability metrics
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Payment methods breakdown
    cash_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    card_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['pharmacy', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics for {self.pharmacy.name} - {self.date}"


class InsuranceClaim(models.Model):
    """Insurance claims processing"""
    CLAIM_STATUS = [
        ('PENDING', 'Pending'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PAID', 'Paid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.OneToOneField('Sales.Sale', on_delete=models.CASCADE, related_name='insurance_claim')
    insurance_provider = models.CharField(max_length=100)
    policy_number = models.CharField(max_length=100)
    claim_number = models.CharField(max_length=100, unique=True)
    patient_id = models.CharField(max_length=100)
    prescriber_name = models.CharField(max_length=255)
    prescriber_license = models.CharField(max_length=100)
    
    # Financial details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    covered_amount = models.DecimalField(max_digits=10, decimal_places=2)
    copay_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deductible_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=CLAIM_STATUS, default='PENDING')
    submitted_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def submit_claim(self):
        """Submit claim to insurance"""
        self.status = 'SUBMITTED'
        self.submitted_at = timezone.now()
        self.save()
    
    def approve_claim(self):
        """Approve claim"""
        self.status = 'APPROVED'
        self.processed_at = timezone.now()
        self.save()
    
    def reject_claim(self, reason):
        """Reject claim"""
        self.status = 'REJECTED'
        self.processed_at = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def __str__(self):
        return f"Claim {self.claim_number} - {self.insurance_provider}"


class DeliveryService(models.Model):
    """Home delivery service management"""
    DELIVERY_STATUS = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PICKED_UP', 'Picked Up'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.OneToOneField('Sales.Sale', on_delete=models.CASCADE, related_name='delivery')
    delivery_address = models.TextField()
    delivery_phone = models.CharField(max_length=20)
    delivery_instructions = models.TextField(blank=True)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Scheduling
    requested_delivery_date = models.DateField()
    requested_delivery_time = models.TimeField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_time = models.TimeField(null=True, blank=True)
    
    # Tracking
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='PENDING')
    tracking_number = models.CharField(max_length=100, unique=True)
    delivery_partner = models.CharField(max_length=100, blank=True)
    driver_name = models.CharField(max_length=255, blank=True)
    driver_phone = models.CharField(max_length=20, blank=True)
    
    # Completion details
    delivered_to = models.CharField(max_length=255, blank=True)
    delivery_notes = models.TextField(blank=True)
    customer_signature = models.TextField(blank=True)  # Base64 encoded signature
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def mark_delivered(self, delivered_to, notes=''):
        """Mark delivery as completed"""
        self.status = 'DELIVERED'
        self.delivered_to = delivered_to
        self.delivery_notes = notes
        self.actual_delivery_date = timezone.now().date()
        self.actual_delivery_time = timezone.now().time()
        self.save()
    
    def __str__(self):
        return f"Delivery {self.tracking_number} - {self.status}"
