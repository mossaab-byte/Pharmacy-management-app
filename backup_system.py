#!/usr/bin/env python3
"""
Script de sauvegarde complète du système de pharmacie
Sauvegarde tous les fichiers importants avec horodatage
"""

import os
import shutil
import datetime
import zipfile
import json

def create_backup():
    # Créer le dossier de sauvegarde avec timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"c:/Users/mohammed/Desktop/PHARMACY_BACKUP_{timestamp}"
    
    print(f"🔄 Création de la sauvegarde dans: {backup_dir}")
    os.makedirs(backup_dir, exist_ok=True)
    
    # Dossiers à sauvegarder
    source_dir = "c:/Users/mohammed/Documents/APPLICATION_PHARMACIE"
    
    # Copier tout le projet
    print("📁 Copie du projet complet...")
    shutil.copytree(source_dir, f"{backup_dir}/APPLICATION_PHARMACIE", 
                   ignore=shutil.ignore_patterns('__pycache__', '*.pyc', 'node_modules', '.git'))
    
    # Créer un résumé de sauvegarde
    summary = {
        "backup_date": timestamp,
        "backup_type": "Complete System Backup",
        "features_implemented": [
            "Real data integration - no mock data",
            "Pharmacist full permissions system",
            "User management with role hierarchy", 
            "Stock management with permissions",
            "Sales workflow fully functional",
            "Customer service with real API",
            "Dashboard with live data",
            "Permission-based access control"
        ],
        "key_files": [
            "backend/Authentification/models.py - User permissions model",
            "backend/Authentification/views.py - Permission management APIs", 
            "frontend/src/services/ - All services updated with real data",
            "frontend/src/components/users/UserManagement.js - User management UI",
            "PERMISSIONS_IMPLEMENTATION_COMPLETE.md - Full documentation",
            "test_real_data_system.py - System validation script",
            "create_test_pharmacist.py - Test user creation"
        ],
        "database_status": "All migrations applied, 41 pharmacists updated with permissions",
        "test_user": {
            "username": "testpharmacist", 
            "password": "testpass123",
            "role": "pharmacist",
            "permissions": "all"
        },
        "endpoints_added": [
            "GET /api/current-user/",
            "GET /api/users/", 
            "POST /api/users/{id}/toggle-manager/",
            "PATCH /api/users/{id}/permissions/"
        ],
        "next_steps": [
            "System is ready for production use",
            "All pharmacists have full control of their pharmacy",
            "Real data integration complete",
            "Permission system fully functional"
        ]
    }
    
    # Sauvegarder le résumé
    with open(f"{backup_dir}/BACKUP_SUMMARY.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    # Créer un ZIP de sauvegarde
    print("🗜️  Création de l'archive ZIP...")
    zip_path = f"{backup_dir}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(backup_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_name = os.path.relpath(file_path, backup_dir)
                zipf.write(file_path, arc_name)
    
    # Créer un script de restauration
    restore_script = f"""@echo off
echo 🔄 Script de restauration du système de pharmacie
echo Date de sauvegarde: {timestamp}
echo.

echo 📁 Extraction de la sauvegarde...
powershell -command "Expand-Archive -Path '{zip_path}' -DestinationPath 'c:/Users/mohammed/Documents/PHARMACY_RESTORED_{timestamp}' -Force"

echo.
echo ✅ Restauration terminée !
echo 📍 Dossier restauré: c:/Users/mohammed/Documents/PHARMACY_RESTORED_{timestamp}/APPLICATION_PHARMACIE
echo.
echo 🚀 Pour redémarrer le système:
echo 1. cd backend ^&^& python manage.py runserver 8000
echo 2. cd frontend ^&^& npm start
echo 3. Utilisateur test: testpharmacist / testpass123
echo.
pause
"""
    
    with open(f"c:/Users/mohammed/Desktop/RESTORE_PHARMACY_{timestamp}.bat", 'w') as f:
        f.write(restore_script)
    
    print(f"✅ Sauvegarde complète terminée !")
    print(f"📁 Dossier: {backup_dir}")
    print(f"🗜️  Archive: {zip_path}")
    print(f"🔧 Script de restauration: RESTORE_PHARMACY_{timestamp}.bat")
    print(f"📊 Résumé: {backup_dir}/BACKUP_SUMMARY.json")
    
    return backup_dir, zip_path

if __name__ == "__main__":
    create_backup()
