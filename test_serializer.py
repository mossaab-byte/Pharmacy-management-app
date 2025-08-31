"""
Test the Purchase serializer directly to see what it returns
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(r'C:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
django.setup()

from Purchases.models import Purchase
from Purchases.serializers import PurchaseSerializer

def test_purchase_serializer():
    print("🧪 Testing Purchase Serializer Output")
    print("=" * 50)
    
    # Get the latest purchase
    purchase = Purchase.objects.order_by('-created_at').first()
    
    if not purchase:
        print("❌ No purchases found in database")
        return
    
    print(f"🔍 Testing purchase: {purchase.id}")
    print(f"🔍 Database total_amount: {purchase.total_amount}")
    print(f"🔍 Database items count: {purchase.items.count()}")
    
    # Serialize the purchase
    serializer = PurchaseSerializer(purchase)
    data = serializer.data
    
    print(f"\n📊 Serializer output:")
    print(f"  - id: {data.get('id')}")
    print(f"  - total: {data.get('total')}")
    print(f"  - total_amount: {data.get('total_amount')}")
    print(f"  - supplier_name: {data.get('supplier_name')}")
    print(f"  - items_count: {data.get('items_count')}")
    print(f"  - status: {data.get('status')}")
    print(f"  - date: {data.get('date')}")
    
    # Check if total matches
    serializer_total = data.get('total')
    db_total = float(purchase.total_amount)
    
    print(f"\n🔍 Comparison:")
    print(f"  - Serializer total: {serializer_total} (type: {type(serializer_total)})")
    print(f"  - Database total: {db_total} (type: {type(db_total)})")
    
    if abs(float(serializer_total) - db_total) < 0.01:  # Allow for small floating point differences
        print("\n✅ Serializer 'total' field is correct!")
    else:
        print(f"\n❌ Serializer 'total' field is wrong! Expected {db_total}, got {serializer_total}")
    
    # Test list serialization (multiple purchases)
    purchases = Purchase.objects.order_by('-created_at')[:3]
    list_serializer = PurchaseSerializer(purchases, many=True)
    list_data = list_serializer.data
    
    print(f"\n📋 List serialization test:")
    for i, item in enumerate(list_data):
        print(f"  Purchase {i+1}: total={item.get('total')}, total_amount={item.get('total_amount')}")

if __name__ == "__main__":
    test_purchase_serializer()
