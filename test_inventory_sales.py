import os, django
import sys
sys.path.append('c:/Users/mohammed/Documents/APPLICATION_PHARMACIE/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Sales.models import Sale, SaleItem
from Pharmacy.models import PharmacyMedicine, Pharmacy
from django.contrib.auth import get_user_model

User = get_user_model()

print('=== INVENTORY TESTING FOR SALES ===')

# Get current user and pharmacy
user = User.objects.first()
if user:
    print(f'Test user: {user.username}')
    if hasattr(user, 'pharmacy') and user.pharmacy:
        pharmacy = user.pharmacy
        print(f'User pharmacy: {pharmacy.name}')
    else:
        pharmacy = Pharmacy.objects.first()
        print(f'Using first pharmacy: {pharmacy.name if pharmacy else "None"}')
    
    if pharmacy:
        # Check some inventory items
        pm_items = PharmacyMedicine.objects.filter(pharmacy=pharmacy)[:5]
        print(f'\nPharmacy medicines count: {pm_items.count()}')
        
        for pm in pm_items:
            print(f'  - {pm.medicine.nom}: Stock={pm.quantity}')
        
        # Check recent sales
        recent_sales = Sale.objects.filter(pharmacy=pharmacy).order_by('-created_at')[:3]
        print(f'\nRecent sales count: {recent_sales.count()}')
        
        for sale in recent_sales:
            print(f'  Sale {sale.id}: Total={sale.total_amount}, Items={sale.items.count()}')
            for item in sale.items.all():
                pm = item.pharmacy_medicine
                print(f'    - {pm.medicine.nom}: Sold={item.quantity}, Current Stock={pm.quantity}')
                
        # Test if inventory endpoint is working correctly
        print(f'\n=== TESTING INVENTORY API ===')
        print(f'Testing PharmacyMedicine.objects.filter(pharmacy={pharmacy.name})')
        
        # Get medicines via different queries to see what's happening
        all_pm = PharmacyMedicine.objects.filter(pharmacy=pharmacy)
        print(f'Total PharmacyMedicine items for {pharmacy.name}: {all_pm.count()}')
        
        # Show first 5 with full details
        for pm in all_pm[:5]:
            print(f'  ID: {pm.id}, Medicine: {pm.medicine.nom}, Stock: {pm.quantity}, Pharmacy: {pm.pharmacy.name}')
            
        # Test the API endpoint logic
        print(f'\n=== TESTING PHARMACY CONTEXT ===')
        print(f'user.pharmacy: {user.pharmacy.name if user.pharmacy else "None"}')
        print(f'hasattr(user, "owned_pharmacy"): {hasattr(user, "owned_pharmacy")}')
        if hasattr(user, 'owned_pharmacy'):
            print(f'user.owned_pharmacy: {user.owned_pharmacy.name if user.owned_pharmacy else "None"}')
            
else:
    print('No users found!')
