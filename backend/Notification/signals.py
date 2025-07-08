# signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.urls import reverse
from django.core.mail import send_mail
from Pharmacy.models import PharmacyMedicine

@receiver(post_save, sender=PharmacyMedicine)
def check_low_stock(sender, instance, **kwargs):
    """Send alerts when stock falls below pharmacy-specific threshold"""
    if instance.quantity < instance.minimum_stock_level:
        # Get absolute URL for admin (requires Django admin setup)
        admin_url = reverse('admin:app_pharmacymedicine_change', args=[instance.id])
        
        # Create context-aware alert message
        alert_msg = (
            f"🚨 LOW STOCK: {instance.medicine.nom} at {instance.pharmacy.name}\n"
            f"• Current quantity: {instance.quantity}\n"
            f"• Alert threshold: {instance.minimum_stock_level}\n"
            f"• Purchase price: ${instance.purchase_price}\n"
            f"• Sale price: ${instance.sale_price}\n"
            f"Admin link: {admin_url}"
        )
        
        send_mail(
            subject=f"Low Stock Alert: {instance.medicine.nom}",
            message=alert_msg,
            from_email="mossaabrahim2021@gmail.com",
            recipient_list=[instance.pharmacy.pharmacist.email],  # pharmacist email here
            fail_silently=False
        )