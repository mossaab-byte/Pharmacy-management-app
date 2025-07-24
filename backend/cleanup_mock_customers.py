#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pharmacy_app.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from Sales.models import Customer, Sale

def cleanup_mock_customers():
    """
    Remove mock/test customers that may have been created during development
    """
    print("🧹 Starting mock customer cleanup...")
    
    # Define patterns for mock customers to remove
    mock_patterns = [
        'test',
        'mock', 
        'demo',
        'example',
        'sample',
        'dummy'
    ]
    
    # Find and remove customers with mock-like names or phone numbers
    mock_customers = []
    
    for customer in Customer.objects.all():
        customer_name = customer.nom.lower() if customer.nom else ""
        customer_phone = customer.telephone.lower() if customer.telephone else ""
        
        # Check if customer name or phone contains mock patterns
        is_mock = any(pattern in customer_name or pattern in customer_phone 
                     for pattern in mock_patterns)
        
        # Additional check for obvious test data
        if (customer_name in ['client test', 'test client', 'test user'] or
            customer_phone in ['123456789', '000000000', '111111111'] or
            customer.nom == customer.telephone):
            is_mock = True
            
        if is_mock:
            mock_customers.append(customer)
    
    if not mock_customers:
        print("✅ No mock customers found to clean up.")
        return
    
    print(f"📋 Found {len(mock_customers)} mock customers to remove:")
    for customer in mock_customers:
        print(f"  - ID: {customer.id}, Name: {customer.nom}, Phone: {customer.telephone}")
    
    # Ask for confirmation
    confirm = input("\n❓ Do you want to remove these customers? (y/N): ").lower()
    if confirm != 'y':
        print("❌ Cleanup cancelled.")
        return
    
    # Remove mock customers and their associated sales
    removed_count = 0
    for customer in mock_customers:
        try:
            # First remove associated sales
            sales_count = Sale.objects.filter(customer=customer).count()
            Sale.objects.filter(customer=customer).delete()
            
            # Then remove customer
            customer.delete()
            removed_count += 1
            
            print(f"✅ Removed customer: {customer.nom} (and {sales_count} associated sales)")
            
        except Exception as e:
            print(f"❌ Error removing customer {customer.nom}: {str(e)}")
    
    print(f"\n🎉 Cleanup completed! Removed {removed_count} mock customers.")

def list_all_customers():
    """List all current customers for review"""
    print("\n📋 Current customers in database:")
    customers = Customer.objects.all().order_by('id')
    
    if not customers:
        print("  No customers found.")
        return
        
    for customer in customers:
        sales_count = Sale.objects.filter(customer=customer).count()
        print(f"  - ID: {customer.id}, Name: {customer.nom}, Phone: {customer.telephone}, Sales: {sales_count}")

if __name__ == "__main__":
    print("🔧 Customer Database Cleanup Tool")
    print("=" * 40)
    
    # First list all customers
    list_all_customers()
    
    print("\n" + "=" * 40)
    
    # Then run cleanup
    cleanup_mock_customers()
    
    print("\n" + "=" * 40)
    print("📊 Final customer list:")
    list_all_customers()
