#!/usr/bin/env python3
import os
import sys
import django

# Ajouter le chemin du projet Django
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')

# Configurer Django
django.setup()

from Authentification.models import PharmacyUser
from Pharmacy.models import Pharmacy
from django.contrib.auth.hashers import make_password

def create_test_pharmacist():
    """Créer un utilisateur pharmacien de test"""
    try:
        # Créer ou obtenir une pharmacie de test
        pharmacy, created = Pharmacy.objects.get_or_create(
            name='Pharmacie Test',
            defaults={
                'address': '123 Rue Test',
                'phone': '0123456789'
            }
        )
        
        if created:
            print(f"✅ Pharmacie créée: {pharmacy.name}")
        else:
            print(f"✅ Pharmacie existante: {pharmacy.name}")

        # Créer un utilisateur pharmacien de test
        user, created = PharmacyUser.objects.get_or_create(
            username='testpharmacist',
            defaults={
                'email': 'test@pharmacy.com',
                'password': make_password('testpass123'),
                'first_name': 'Dr',
                'last_name': 'Pharmacien',
                'is_pharmacist': True,
                'pharmacy': pharmacy,
                'can_manage_inventory': True,
                'can_manage_sales': True,
                'can_manage_purchases': True,
                'can_manage_users': True,
                'can_view_reports': True
            }
        )

        if created:
            print(f"✅ Utilisateur pharmacien créé: {user.username}")
        else:
            print(f"✅ Utilisateur pharmacien existant: {user.username}")
            # Mettre à jour pour s'assurer qu'il a toutes les permissions
            user.is_pharmacist = True
            user.can_manage_inventory = True
            user.can_manage_sales = True
            user.can_manage_purchases = True
            user.can_manage_users = True
            user.can_view_reports = True
            user.save()
            print("   - Permissions mises à jour")

        print(f"Informations du pharmacien:")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Pharmacie: {pharmacy.name}")
        print(f"   - Est pharmacien: {user.is_pharmacist}")
        print(f"Permissions:")
        print(f"   - Can manage inventory: {user.can_manage_inventory}")
        print(f"   - Can manage sales: {user.can_manage_sales}")
        print(f"   - Can manage purchases: {user.can_manage_purchases}")
        print(f"   - Can manage users: {user.can_manage_users}")
        print(f"   - Can view reports: {user.can_view_reports}")
        
        return user, pharmacy
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return None, None

if __name__ == '__main__':
    create_test_pharmacist()
