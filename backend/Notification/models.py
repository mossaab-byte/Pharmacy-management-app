from django.db import models
from Authentification.models import *
# Create your models here.
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('sale_modified', 'Sale Modified'),
        ('stock_low', 'Low Stock Alert'),
        ('payment_received', 'Payment Received'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(PharmacyUser, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(PharmacyUser, on_delete=models.CASCADE, related_name='sent_notifications', null=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_object_id = models.UUIDField(null=True, blank=True)  # For linking to sale, etc.
    
    class Meta:
        ordering = ['-created_at']
    
    def mark_as_read(self):
        self.is_read = True
        self.save()