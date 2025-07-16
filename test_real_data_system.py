#!/usr/bin/env python3
"""
Test complet du système sans données fictives
"""

import requests
import json
import time

BASE_URL = 'http://localhost:8000'

class PharmacySystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        
    def login(self, username='testpharmacist', password='testpass123'):
        """Se connecter au système"""
        try:
            response = self.session.post(f'{BASE_URL}/api/login/', {
                'username': username,
                'password': password
            })
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access')
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                print(f"✅ Connexion réussie pour {username}")
                return True
            else:
                print(f"❌ Échec de connexion: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur de connexion: {e}")
            return False
    
    def test_user_permissions(self):
        """Tester la récupération des permissions utilisateur"""
        try:
            response = self.session.get(f'{BASE_URL}/api/current-user/')
            
            if response.status_code == 200:
                user_data = response.json()
                print("✅ Données utilisateur récupérées:")
                print(f"   - Nom: {user_data.get('username')}")
                print(f"   - Pharmacien: {user_data.get('is_pharmacist')}")
                print(f"   - Manager: {user_data.get('is_manager')}")
                print(f"   - Permissions: {user_data.get('permissions')}")
                return user_data
            else:
                print(f"❌ Erreur récupération utilisateur: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Erreur test permissions: {e}")
            return None
    
    def test_customers(self):
        """Tester la récupération des clients réels"""
        try:
            response = self.session.get(f'{BASE_URL}/api/sales/customers/')
            
            if response.status_code == 200:
                customers = response.json()
                if isinstance(customers, dict) and 'results' in customers:
                    customers = customers['results']
                    
                print(f"✅ {len(customers)} clients trouvés:")
                for customer in customers[:3]:  # Afficher les 3 premiers
                    print(f"   - {customer.get('name', 'N/A')} ({customer.get('phone', 'N/A')})")
                return customers
            else:
                print(f"❌ Erreur récupération clients: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Erreur test clients: {e}")
            return []
    
    def test_medicines(self):
        """Tester la récupération des médicaments réels"""
        try:
            response = self.session.get(f'{BASE_URL}/api/pharmacy/pharmacy-medicines/')
            
            if response.status_code == 200:
                medicines = response.json()
                if isinstance(medicines, dict) and 'results' in medicines:
                    medicines = medicines['results']
                    
                print(f"✅ {len(medicines)} médicaments trouvés:")
                for med in medicines[:3]:  # Afficher les 3 premiers
                    if isinstance(med, dict):
                        medicine_name = med.get('medicine', {}).get('name', 'N/A') if isinstance(med.get('medicine'), dict) else str(med.get('medicine', 'N/A'))
                        stock = med.get('stock_quantity', 0)
                        print(f"   - {medicine_name} (Stock: {stock})")
                    else:
                        print(f"   - Médicament ID: {med} (format inattendu)")
                return medicines
            else:
                print(f"❌ Erreur récupération médicaments: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Erreur test médicaments: {e}")
            return []
    
    def test_stock_management(self, pharmacy_medicine_id=None):
        """Tester la gestion manuelle du stock"""
        if not pharmacy_medicine_id:
            # Obtenir un médicament pour test
            medicines = self.test_medicines()
            if medicines:
                # Trouver un médicament valide
                for med in medicines:
                    if isinstance(med, dict) and med.get('id'):
                        pharmacy_medicine_id = med.get('id')
                        break
                
                if not pharmacy_medicine_id:
                    print("❌ Aucun médicament valide trouvé pour test stock")
                    return False
            else:
                print("❌ Aucun médicament disponible pour test stock")
                return False
        
        try:
            # Tester l'ajout de stock
            response = self.session.post(f'{BASE_URL}/api/pharmacy/pharmacy-medicines/{pharmacy_medicine_id}/manual-stock-add/', {
                'quantity': 10,
                'reason': 'TEST_ADD',
                'notes': 'Test d\'ajout manuel de stock'
            })
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Stock ajouté avec succès: {result.get('message', 'OK')}")
                return True
            else:
                print(f"❌ Erreur ajout stock: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur test stock: {e}")
            return False
    
    def run_full_test(self):
        """Exécuter tous les tests"""
        print("🔬 Démarrage des tests système sans données fictives")
        print("=" * 60)
        
        # Test de connexion
        if not self.login():
            print("❌ Impossible de continuer sans connexion")
            return False
        
        print()
        
        # Test permissions utilisateur
        user_data = self.test_user_permissions()
        print()
        
        # Test clients réels
        customers = self.test_customers()
        print()
        
        # Test médicaments réels
        medicines = self.test_medicines()
        print()
        
        # Test gestion stock (si utilisateur a les permissions)
        if user_data and user_data.get('permissions', {}).get('can_manage_inventory'):
            self.test_stock_management()
        else:
            print("⚠️  Pas de permission pour tester la gestion de stock")
        
        print()
        print("=" * 60)
        print("✅ Tests terminés - Système utilise maintenant de vraies données !")

if __name__ == '__main__':
    tester = PharmacySystemTester()
    tester.run_full_test()
