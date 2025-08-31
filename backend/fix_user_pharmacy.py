#!/usr/bin/env python3
"""
Script pour associer un utilisateur à une pharmacie pour permettre les ventes
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy

User = get_user_model()

def main():
    print("=== CORRECTION ASSOCIATION UTILISATEUR-PHARMACIE ===\n")
    
    # Lister les utilisateurs sans pharmacie
    users_without_pharmacy = User.objects.filter(pharmacy=None)
    print(f"Utilisateurs sans pharmacie: {users_without_pharmacy.count()}")
    
    # Lister les pharmacies disponibles
    pharmacies = Pharmacy.objects.all()
    print(f"Pharmacies disponibles: {pharmacies.count()}")
    
    for pharmacy in pharmacies:
        print(f"  - {pharmacy.name} (ID: {pharmacy.id})")
    
    if pharmacies.exists():
        # Prendre la première pharmacie disponible
        default_pharmacy = pharmacies.first()
        print(f"\nUtilisation de la pharmacie par défaut: {default_pharmacy.name}")
        
        # Associer tous les utilisateurs sans pharmacie à la pharmacie par défaut
        # (sauf les customers)
        users_to_update = users_without_pharmacy.exclude(is_customer=True)
        
        print(f"\nAssociation de {users_to_update.count()} utilisateurs à la pharmacie...")
        
        for user in users_to_update:
            user.pharmacy = default_pharmacy
            user.save()
            print(f"  ✅ {user.username} associé à {default_pharmacy.name}")
        
        print(f"\n✅ Association terminée!")
        
        # Vérification
        print("\n=== VÉRIFICATION ===")
        remaining_users = User.objects.filter(pharmacy=None, is_customer=False)
        print(f"Utilisateurs non-customer sans pharmacie: {remaining_users.count()}")
        
    else:
        print("❌ Aucune pharmacie disponible! Créons une pharmacie par défaut...")
        
        # Créer une pharmacie par défaut
        default_pharmacy = Pharmacy.objects.create(
            name="Pharmacie par défaut",
            address="Adresse par défaut",
            phone="0000000000"
        )
        print(f"✅ Pharmacie créée: {default_pharmacy.name}")
        
        # Associer tous les utilisateurs non-customer
        users_to_update = users_without_pharmacy.exclude(is_customer=True)
        
        for user in users_to_update:
            user.pharmacy = default_pharmacy
            user.save()
            print(f"  ✅ {user.username} associé à {default_pharmacy.name}")

if __name__ == "__main__":
    main()
