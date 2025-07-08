#!/usr/bin/env python
"""
Simple script to check imported medicine data
"""
import os
import sys
import django

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Medicine.models import Medicine

def main():
    total = Medicine.objects.count()
    print(f"Total medicines imported: {total}")
    
    if total > 0:
        print("\nSample medicines:")
        for medicine in Medicine.objects.all()[:5]:
            print(f"- {medicine.nom} ({medicine.code}) - {medicine.dci1} - {medicine.forme}")
        
        print(f"\nBreakdown by type:")
        princeps_count = Medicine.objects.filter(princeps_generique='P').count()
        generique_count = Medicine.objects.filter(princeps_generique='G').count()
        print(f"- Princeps: {princeps_count}")
        print(f"- Générique: {generique_count}")
        
        print(f"\nPrice range:")
        medicines_with_price = Medicine.objects.exclude(ppv__isnull=True)
        if medicines_with_price.exists():
            min_medicine = medicines_with_price.order_by('ppv').first()
            max_medicine = medicines_with_price.order_by('-ppv').first()
            print(f"- Cheapest: {min_medicine.nom} - {min_medicine.ppv} DH")
            print(f"- Most expensive: {max_medicine.nom} - {max_medicine.ppv} DH")
            
        print(f"\nTop 3 most expensive medicines:")
        for medicine in Medicine.objects.exclude(ppv__isnull=True).order_by('-ppv')[:3]:
            print(f"- {medicine.nom} - {medicine.ppv} DH")
    else:
        print("No medicines found in database.")

if __name__ == '__main__':
    main()
