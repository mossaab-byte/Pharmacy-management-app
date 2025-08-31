from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class EmployeeRole(models.Model):
    """Predefined roles for employees"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Default permissions for this role
    can_manage_inventory = models.BooleanField(default=False)
    can_manage_sales = models.BooleanField(default=True)
    can_manage_purchases = models.BooleanField(default=False)
    can_manage_customers = models.BooleanField(default=False)
    can_manage_employees = models.BooleanField(default=False)
    can_manage_suppliers = models.BooleanField(default=False)
    can_view_reports = models.BooleanField(default=False)
    can_manage_medicines = models.BooleanField(default=False)
    can_view_dashboard = models.BooleanField(default=True)
    can_manage_exchanges = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Employee(models.Model):
    """Employee model linking users to pharmacies with specific roles and permissions"""
    
    EMPLOYMENT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE, related_name='employees')
    role = models.ForeignKey(EmployeeRole, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Employment details
    employee_id = models.CharField(max_length=50, unique=True, blank=True)
    hire_date = models.DateField()
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    position_title = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    # Contact and personal info
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Custom permissions (override role defaults if needed)
    custom_permissions_enabled = models.BooleanField(default=False)
    can_manage_inventory = models.BooleanField(null=True, blank=True)
    can_manage_sales = models.BooleanField(null=True, blank=True)
    can_manage_purchases = models.BooleanField(null=True, blank=True)
    can_manage_customers = models.BooleanField(null=True, blank=True)
    can_manage_employees = models.BooleanField(null=True, blank=True)
    can_manage_suppliers = models.BooleanField(null=True, blank=True)
    can_view_reports = models.BooleanField(null=True, blank=True)
    can_manage_medicines = models.BooleanField(null=True, blank=True)
    can_view_dashboard = models.BooleanField(null=True, blank=True)
    can_manage_exchanges = models.BooleanField(null=True, blank=True)
    
    # Audit fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_employees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.pharmacy.name}"
    
    def get_permission(self, permission_name):
        """Get effective permission value (custom override or role default)"""
        if self.custom_permissions_enabled:
            custom_value = getattr(self, permission_name, None)
            if custom_value is not None:
                return custom_value
        
        if self.role:
            return getattr(self.role, permission_name, False)
        
        return False
    
    def get_all_permissions(self):
        """Return a dictionary of all effective permissions"""
        permissions = {}
        permission_fields = [
            'can_manage_inventory', 'can_manage_sales', 'can_manage_purchases',
            'can_manage_customers', 'can_manage_employees', 'can_manage_suppliers',
            'can_view_reports', 'can_manage_medicines', 'can_view_dashboard',
            'can_manage_exchanges'
        ]
        
        for perm in permission_fields:
            permissions[perm] = self.get_permission(perm)
        
        return permissions
    
    def save(self, *args, **kwargs):
        # Generate employee ID if not provided
        if not self.employee_id:
            pharmacy_code = self.pharmacy.name[:3].upper() if self.pharmacy else 'EMP'
            # Get the last employee number for this pharmacy
            last_employee = Employee.objects.filter(
                pharmacy=self.pharmacy,
                employee_id__startswith=pharmacy_code
            ).order_by('-employee_id').first()
            
            if last_employee and last_employee.employee_id:
                try:
                    last_num = int(last_employee.employee_id[3:])
                    new_num = last_num + 1
                except (ValueError, IndexError):
                    new_num = 1
            else:
                new_num = 1
            
            self.employee_id = f"{pharmacy_code}{new_num:04d}"
        
        # Update user pharmacy association
        if self.user and self.pharmacy:
            self.user.pharmacy = self.pharmacy
            self.user.save()
        
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'pharmacy']


class EmployeeActivityLog(models.Model):
    """Log employee activities for audit purposes"""
    
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('create', 'Create Record'),
        ('update', 'Update Record'),
        ('delete', 'Delete Record'),
        ('view', 'View Record'),
        ('permission_change', 'Permission Change'),
        ('status_change', 'Status Change'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100, blank=True)  # e.g., 'Sale', 'Purchase', 'Medicine'
    resource_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.employee.user.username} - {self.action} - {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']
