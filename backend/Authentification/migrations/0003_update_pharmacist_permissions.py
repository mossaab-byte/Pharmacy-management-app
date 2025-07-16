# Generated manually for updating pharmacist permissions

from django.db import migrations

def update_pharmacist_permissions(apps, schema_editor):
    """Mettre à jour les permissions pour tous les pharmaciens existants"""
    PharmacyUser = apps.get_model('Authentification', 'PharmacyUser')
    
    # Mettre à jour tous les pharmaciens pour qu'ils aient toutes les permissions
    pharmacists = PharmacyUser.objects.filter(is_pharmacist=True)
    for pharmacist in pharmacists:
        pharmacist.can_manage_inventory = True
        pharmacist.can_manage_sales = True
        pharmacist.can_manage_purchases = True
        pharmacist.can_manage_users = True
        pharmacist.can_view_reports = True
        pharmacist.save()
    
    print(f"✅ Mis à jour {pharmacists.count()} pharmaciens avec toutes les permissions")

def reverse_pharmacist_permissions(apps, schema_editor):
    """Fonction de retour pour annuler la migration si nécessaire"""
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('Authentification', '0004_pharmacyuser_can_manage_inventory_and_more'),
    ]

    operations = [
        migrations.RunPython(update_pharmacist_permissions, reverse_pharmacist_permissions),
    ]
