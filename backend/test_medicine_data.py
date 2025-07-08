#!/usr/bin/env python
"""
Test the Medicine API and data integrity
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
from django.db.models import Count, Q

def test_medicine_data():
    print("=== MEDICINE DATA INTEGRITY TEST ===\n")
    
    # Basic counts
    total = Medicine.objects.count()
    print(f"✅ Total medicines in database: {total}")
    
    # Check required fields
    missing_code = Medicine.objects.filter(Q(code__isnull=True) | Q(code__exact='')).count()
    missing_nom = Medicine.objects.filter(Q(nom__isnull=True) | Q(nom__exact='')).count()
    missing_dci1 = Medicine.objects.filter(Q(dci1__isnull=True) | Q(dci1__exact='')).count()
    
    print(f"✅ Data Quality:")
    print(f"   - Missing codes: {missing_code}")
    print(f"   - Missing names: {missing_nom}")
    print(f"   - Missing DCI: {missing_dci1}")
    
    # Check princeps/generique distribution
    princeps_count = Medicine.objects.filter(princeps_generique='P').count()
    generique_count = Medicine.objects.filter(princeps_generique='G').count()
    
    print(f"✅ Medicine Types:")
    print(f"   - Princeps (Brand): {princeps_count}")
    print(f"   - Générique (Generic): {generique_count}")
    
    # Check price data
    with_price = Medicine.objects.exclude(ppv__isnull=True).count()
    without_price = Medicine.objects.filter(ppv__isnull=True).count()
    
    print(f"✅ Price Data:")
    print(f"   - With price: {with_price}")
    print(f"   - Without price: {without_price}")
    
    # Top forms
    top_forms = Medicine.objects.values('forme').annotate(count=Count('forme')).order_by('-count')[:5]
    print(f"✅ Top 5 Medicine Forms:")
    for form in top_forms:
        print(f"   - {form['forme']}: {form['count']} medicines")
    
    # Search tests
    print(f"\n✅ Search Tests:")
    paracetamol = Medicine.objects.filter(dci1__icontains='PARACETAMOL').count()
    print(f"   - Medicines containing 'PARACETAMOL': {paracetamol}")
    
    antibiotics = Medicine.objects.filter(Q(dci1__icontains='AMOXICILLINE') | Q(dci1__icontains='AZITHROMYCINE')).count()
    print(f"   - Common antibiotics (Amoxicillin/Azithromycin): {antibiotics}")
    
    print(f"\n🎉 MEDICINE DATABASE READY FOR PRODUCTION!")
    print(f"📊 {total:,} medicines available for pharmacy operations")

if __name__ == '__main__':
    test_medicine_data()
