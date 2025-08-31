import os, django
import sys
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem
from Pharmacy.models import PharmacyMedicine, Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print('=== TESTING PHARMACY FILTERING FIX ===')

# Test the serializer logic manually
def test_pharmacy_medicine_selection(medicine_id, user):
    """Test how PharmacyMedicine is selected for a given user and medicine"""
    
    user_pharmacy = None
    
    # Check if user has owned_pharmacy
    if hasattr(user, 'owned_pharmacy') and user.owned_pharmacy:
        user_pharmacy = user.owned_pharmacy
    # Check if user has pharmacy attribute
    elif hasattr(user, 'pharmacy') and user.pharmacy:
        user_pharmacy = user.pharmacy
    # Check if user is a manager with pharmacy access
    else:
        from Pharmacy.models import Manager
        manager_permission = Manager.objects.filter(user=user).first()
        if manager_permission:
            user_pharmacy = manager_permission.pharmacy
    
    print(f'User {user.username} -> Pharmacy: {user_pharmacy.name if user_pharmacy else "None"}')
    
    # Get all PharmacyMedicine for this medicine (old way)
    all_pm = PharmacyMedicine.objects.filter(medicine_id=medicine_id)
    print(f'All PharmacyMedicine for medicine_id {medicine_id}:')
    for pm in all_pm:
        print(f'  - Pharmacy: {pm.pharmacy.name}, Stock: {pm.quantity}')
    
    # Get PharmacyMedicine filtered by user's pharmacy (new way)
    if user_pharmacy:
        filtered_pm = PharmacyMedicine.objects.filter(
            medicine_id=medicine_id,
            pharmacy=user_pharmacy
        ).first()
        
        if filtered_pm:
            print(f'✅ CORRECT: Selected PharmacyMedicine from {filtered_pm.pharmacy.name} with stock {filtered_pm.quantity}')
        else:
            print(f'❌ ISSUE: No PharmacyMedicine found for medicine_id {medicine_id} in pharmacy {user_pharmacy.name}')
    else:
        print(f'❌ ISSUE: User has no pharmacy association')
    
    print('---')

# Test with different users
print('Testing pharmacy medicine selection for different users:')

# Find a medicine that exists in multiple pharmacies
from Medicine.models import Medicine
medicine = Medicine.objects.filter(
    pharmacymedicine__isnull=False
).first()

if medicine:
    print(f'Testing with medicine: {medicine.nom} (ID: {medicine.id})')
    
    # Test with different users
    users_to_test = User.objects.filter(pharmacy__isnull=False)[:3]
    for user in users_to_test:
        test_pharmacy_medicine_selection(medicine.id, user)
else:
    print('No medicines found with pharmacy associations')

print('\n=== VERIFYING CURRENT USER ASSOCIATIONS ===')
current_user = User.objects.first()
if current_user:
    print(f'Current user: {current_user.username}')
    print(f'Has pharmacy: {current_user.pharmacy.name if current_user.pharmacy else "None"}')
    print(f'Pharmacy medicines count: {PharmacyMedicine.objects.filter(pharmacy=current_user.pharmacy).count() if current_user.pharmacy else 0}')
