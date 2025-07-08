from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from Medicine.models import Medicine
import uuid

class DrugCategory(models.Model):
    """Categories for medicines (Antibiotics, Pain relievers, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color_code = models.CharField(max_length=7, default='#007bff')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Drug Categories"
    
    def __str__(self):
        return self.name

class DrugInteraction(models.Model):
    """Drug interaction warnings"""
    SEVERITY_CHOICES = [
        ('LOW', 'Low Risk'),
        ('MODERATE', 'Moderate Risk'),
        ('HIGH', 'High Risk'),
        ('CONTRAINDICATED', 'Contraindicated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine_a = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='interactions_a')
    medicine_b = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='interactions_b')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    description = models.TextField()
    recommendation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['medicine_a', 'medicine_b']
    
    def __str__(self):
        return f"{self.medicine_a.nom} ↔ {self.medicine_b.nom} ({self.severity})"

class Prescription(models.Model):
    """Electronic prescriptions"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('FILLED', 'Filled'),
        ('PARTIALLY_FILLED', 'Partially Filled'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey('Sales.Customer', on_delete=models.CASCADE)
    prescriber_name = models.CharField(max_length=255)
    prescriber_license = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField()
    filled_at = models.DateTimeField(null=True, blank=True)
    filled_by = models.ForeignKey('Authentification.PharmacyUser', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Prescription {self.prescription_number}"

class PrescriptionItem(models.Model):
    """Items in a prescription"""
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity_prescribed = models.PositiveIntegerField()
    quantity_filled = models.PositiveIntegerField(default=0)
    dosage_instructions = models.TextField()
    frequency = models.CharField(max_length=100)  # "3 times daily", "as needed", etc.
    duration = models.CharField(max_length=100)   # "7 days", "until finished", etc.
    
    def __str__(self):
        return f"{self.medicine.nom} - {self.quantity_prescribed} units"

class AllergyAlert(models.Model):
    """Customer allergy alerts"""
    SEVERITY_CHOICES = [
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('LIFE_THREATENING', 'Life Threatening'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey('Sales.Customer', on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=255)  # Drug name or ingredient
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    symptoms = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.customer} - {self.allergen} ({self.severity})"

class MedicineStock(models.Model):
    """Enhanced stock management with expiry tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy_medicine = models.ForeignKey('Pharmacy.PharmacyMedicine', on_delete=models.CASCADE, related_name='stock_batches')
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey('Purchases.Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    received_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['pharmacy_medicine', 'batch_number']
        ordering = ['expiry_date']
    
    def __str__(self):
        return f"{self.pharmacy_medicine.medicine.nom} - Batch {self.batch_number}"
    
    @property
    def days_to_expiry(self):
        from django.utils import timezone
        return (self.expiry_date - timezone.now().date()).days
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()
    
    @property
    def is_near_expiry(self, days=30):
        return self.days_to_expiry <= days

class InsuranceClaim(models.Model):
    """Insurance claims for prescriptions"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PAID', 'Paid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)
    insurance_provider = models.CharField(max_length=255)
    policy_number = models.CharField(max_length=100)
    claim_amount = models.DecimalField(max_digits=10, decimal_places=2)
    copay_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    submitted_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    def __str__(self):
        return f"Claim {self.id} - {self.insurance_provider}"
