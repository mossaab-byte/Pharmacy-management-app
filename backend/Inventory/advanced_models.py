from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid

class InventoryAlert(models.Model):
    """Automated inventory alerts"""
    ALERT_TYPES = [
        ('LOW_STOCK', 'Low Stock'),
        ('OUT_OF_STOCK', 'Out of Stock'),
        ('NEAR_EXPIRY', 'Near Expiry'),
        ('EXPIRED', 'Expired'),
        ('OVERSTOCK', 'Overstock'),
        ('FAST_MOVING', 'Fast Moving'),
        ('SLOW_MOVING', 'Slow Moving'),
    ]
    
    PRIORITY_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alert_type} - {self.medicine.nom}"

class StockMovement(models.Model):
    """Detailed stock movement tracking"""
    MOVEMENT_TYPES = [
        ('PURCHASE', 'Purchase'),
        ('SALE', 'Sale'),
        ('RETURN', 'Return'),
        ('TRANSFER_IN', 'Transfer In'),
        ('TRANSFER_OUT', 'Transfer Out'),
        ('ADJUSTMENT', 'Adjustment'),
        ('EXPIRED', 'Expired'),
        ('DAMAGED', 'Damaged'),
        ('THEFT', 'Theft'),
        ('PROMOTION', 'Promotion'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()  # Positive for incoming, negative for outgoing
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)  # Sale ID, Purchase ID, etc.
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.movement_type} - {self.quantity} x {self.pharmacy_medicine.medicine.nom}"

class StockTake(models.Model):
    """Physical stock counting sessions"""
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    scheduled_date = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Stock Take: {self.name}"

class StockTakeItem(models.Model):
    """Individual items in stock take"""
    stock_take = models.ForeignKey(StockTake, on_delete=models.CASCADE, related_name='items')
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE)
    system_quantity = models.PositiveIntegerField()  # What system shows
    counted_quantity = models.PositiveIntegerField(null=True, blank=True)  # What was actually counted
    variance = models.IntegerField(default=0)  # Difference
    notes = models.TextField(blank=True)
    counted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    counted_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if self.counted_quantity is not None:
            self.variance = self.counted_quantity - self.system_quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.pharmacy_medicine.medicine.nom} - Variance: {self.variance}"

class AutoOrderRule(models.Model):
    """Automatic ordering rules"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE, related_name='auto_order_rules')
    min_stock_level = models.PositiveIntegerField()
    max_stock_level = models.PositiveIntegerField()
    reorder_quantity = models.PositiveIntegerField()
    preferred_supplier = models.ForeignKey('Purchases.Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Auto Order: {self.pharmacy_medicine.medicine.nom}"

class WastageRecord(models.Model):
    """Track medicine wastage"""
    WASTAGE_REASONS = [
        ('EXPIRED', 'Expired'),
        ('DAMAGED', 'Damaged'),
        ('CONTAMINATED', 'Contaminated'),
        ('RECALLED', 'Recalled'),
        ('PATIENT_RETURNED', 'Patient Returned'),
        ('INCORRECT_STORAGE', 'Incorrect Storage'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE, related_name='wastage_records')
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=20, choices=WASTAGE_REASONS)
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    cost_impact = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reported_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Wastage: {self.quantity} x {self.pharmacy_medicine.medicine.nom}"

class SupplierPerformance(models.Model):
    """Track supplier performance metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey('Purchases.Supplier', on_delete=models.CASCADE, related_name='performance_metrics')
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Performance metrics
    total_orders = models.PositiveIntegerField(default=0)
    on_time_deliveries = models.PositiveIntegerField(default=0)
    quality_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # 0-5 rating
    price_competitiveness = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # 0-5 rating
    communication_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # 0-5 rating
    
    # Calculated fields
    on_time_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    average_delivery_time = models.PositiveIntegerField(default=0)  # in days
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def calculate_metrics(self):
        """Calculate performance metrics"""
        if self.total_orders > 0:
            self.on_time_percentage = (self.on_time_deliveries / self.total_orders) * 100
        
        # Calculate overall rating (weighted average)
        weights = {'quality': 0.3, 'price': 0.25, 'delivery': 0.25, 'communication': 0.2}
        delivery_score = self.on_time_percentage / 20  # Convert percentage to 0-5 scale
        
        self.overall_rating = (
            (self.quality_score * weights['quality']) +
            (self.price_competitiveness * weights['price']) +
            (delivery_score * weights['delivery']) +
            (self.communication_score * weights['communication'])
        )
        
        self.save()
    
    def __str__(self):
        return f"{self.supplier.name} - Rating: {self.overall_rating}"

class BatchTracking(models.Model):
    """Advanced batch tracking with expiry management"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=100)
    lot_number = models.CharField(max_length=100, blank=True)
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()
    quantity_received = models.PositiveIntegerField()
    quantity_remaining = models.PositiveIntegerField()
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey('Purchases.Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    received_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['pharmacy_medicine', 'batch_number']
        ordering = ['expiry_date']
    
    @property
    def days_to_expiry(self):
        return (self.expiry_date - timezone.now().date()).days
    
    @property
    def is_expired(self):
        return self.expiry_date <= timezone.now().date()
    
    @property
    def is_near_expiry(self, warning_days=30):
        return 0 < self.days_to_expiry <= warning_days
    
    def reduce_quantity(self, amount):
        if amount > self.quantity_remaining:
            raise ValueError("Cannot reduce more than remaining quantity")
        self.quantity_remaining -= amount
        if self.quantity_remaining == 0:
            self.is_active = False
        self.save()
    
    def __str__(self):
        return f"Batch {self.batch_number} - {self.pharmacy_medicine.medicine.nom}"


class DrugInteractionAlert(models.Model):
    """Track potential drug interactions"""
    SEVERITY_LEVELS = [
        ('MINOR', 'Minor'),
        ('MODERATE', 'Moderate'),
        ('MAJOR', 'Major'),
        ('CONTRAINDICATED', 'Contraindicated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine_a = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='interactions_as_a')
    medicine_b = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE, related_name='interactions_as_b')
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    description = models.TextField()
    clinical_effects = models.TextField(blank=True)
    management_recommendations = models.TextField(blank=True)
    evidence_level = models.CharField(max_length=20, default='ESTABLISHED')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['medicine_a', 'medicine_b']
    
    def __str__(self):
        return f"Interaction: {self.medicine_a.nom} + {self.medicine_b.nom} ({self.severity})"


class QualityControl(models.Model):
    """Quality control checks for medicines"""
    CHECK_TYPES = [
        ('VISUAL_INSPECTION', 'Visual Inspection'),
        ('PACKAGING_INTEGRITY', 'Packaging Integrity'),
        ('EXPIRY_CHECK', 'Expiry Check'),
        ('STORAGE_CONDITIONS', 'Storage Conditions'),
        ('TEMPERATURE_LOG', 'Temperature Log'),
        ('BATCH_VERIFICATION', 'Batch Verification'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PASSED', 'Passed'),
        ('FAILED', 'Failed'),
        ('REQUIRES_ACTION', 'Requires Action'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    batch = models.ForeignKey(BatchTracking, on_delete=models.SET_NULL, null=True, blank=True)
    check_type = models.CharField(max_length=30, choices=CHECK_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    findings = models.TextField(blank=True)
    actions_taken = models.TextField(blank=True)
    checked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    checked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-checked_at']
    
    def __str__(self):
        return f"QC Check: {self.medicine.nom} - {self.get_check_type_display()}"


class PrescriptionValidation(models.Model):
    """Validate prescriptions against inventory and drug interactions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription_number = models.CharField(max_length=100, unique=True)
    patient_name = models.CharField(max_length=255)
    prescriber_name = models.CharField(max_length=255)
    prescriber_license = models.CharField(max_length=100)
    issued_date = models.DateField()
    valid_until = models.DateField()
    is_valid = models.BooleanField(default=True)
    validation_notes = models.TextField(blank=True)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    validated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Prescription {self.prescription_number} - {self.patient_name}"


class PrescriptionItem(models.Model):
    """Individual medicines in a prescription"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(PrescriptionValidation, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    quantity_prescribed = models.PositiveIntegerField()
    dosage_instructions = models.TextField()
    quantity_dispensed = models.PositiveIntegerField(default=0)
    is_dispensed = models.BooleanField(default=False)
    interaction_warnings = models.TextField(blank=True)
    substitution_allowed = models.BooleanField(default=False)
    generic_substituted = models.ForeignKey('Medicine.Medicine', on_delete=models.SET_NULL, null=True, blank=True, related_name='substituted_for')
    
    def __str__(self):
        return f"{self.medicine.nom} - {self.quantity_prescribed} units"


class InventoryOptimization(models.Model):
    """AI-powered inventory optimization recommendations"""
    RECOMMENDATION_TYPES = [
        ('STOCK_INCREASE', 'Increase Stock'),
        ('STOCK_DECREASE', 'Decrease Stock'), 
        ('REORDER_POINT_ADJUST', 'Adjust Reorder Point'),
        ('SUPPLIER_CHANGE', 'Change Supplier'),
        ('DISCONTINUE', 'Discontinue Product'),
        ('SEASONAL_ADJUST', 'Seasonal Adjustment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE)
    recommendation_type = models.CharField(max_length=30, choices=RECOMMENDATION_TYPES)
    current_value = models.CharField(max_length=100)
    recommended_value = models.CharField(max_length=100)
    reasoning = models.TextField()
    potential_savings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, default=0)  # 0-1 scale
    is_implemented = models.BooleanField(default=False)
    implemented_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-confidence_score', '-potential_savings']
    
    def implement_recommendation(self, user):
        """Mark recommendation as implemented"""
        self.is_implemented = True
        self.implemented_by = user
        self.save()
    
    def __str__(self):
        return f"Optimization: {self.get_recommendation_type_display()} for {self.pharmacy_medicine.medicine.nom}"


class SeasonalDemandPattern(models.Model):
    """Track seasonal demand patterns for medicines"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    month = models.PositiveIntegerField()  # 1-12
    average_demand = models.DecimalField(max_digits=10, decimal_places=2)
    peak_demand = models.DecimalField(max_digits=10, decimal_places=2)
    demand_variance = models.DecimalField(max_digits=10, decimal_places=2)
    years_analyzed = models.PositiveIntegerField()
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['pharmacy', 'medicine', 'month']
    
    def __str__(self):
        return f"Demand Pattern: {self.medicine.nom} - Month {self.month}"


class ColdChainMonitoring(models.Model):
    """Monitor temperature-sensitive medicines"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    medicine = models.ForeignKey('Medicine.Medicine', on_delete=models.CASCADE)
    required_temp_min = models.DecimalField(max_digits=5, decimal_places=2)  # Celsius
    required_temp_max = models.DecimalField(max_digits=5, decimal_places=2)  # Celsius
    current_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_within_range = models.BooleanField(default=True)
    alert_threshold_breached = models.BooleanField(default=False)
    last_checked = models.DateTimeField(auto_now=True)
    
    def check_temperature_compliance(self):
        """Check if current temperature is within required range"""
        self.is_within_range = self.required_temp_min <= self.current_temperature <= self.required_temp_max
        if not self.is_within_range:
            self.alert_threshold_breached = True
        self.save()
    
    def __str__(self):
        return f"Cold Chain: {self.medicine.nom} - {self.current_temperature}°C"
