from django.core.management.base import BaseCommand
from Sales.models import Sale, SaleItem
from decimal import Decimal

class Command(BaseCommand):
    help = 'Fix all sales totals by recalculating them from their items'

    def handle(self, *args, **options):
        self.stdout.write("🔧 Starting sales total fix...")
        
        # Get all sales
        sales = Sale.objects.all()
        self.stdout.write(f"📊 Found {sales.count()} sales to check")
        
        fixed_count = 0
        
        for sale in sales:
            # Calculate what the total should be
            items = SaleItem.objects.filter(sale=sale)
            
            self.stdout.write(f"\n🔍 Checking Sale {sale.reference}")
            self.stdout.write(f"   Current total_amount: {sale.total_amount}")
            self.stdout.write(f"   Items count: {items.count()}")
            
            if items.exists():
                # First ensure all sale items have correct subtotals
                for item in items:
                    expected_subtotal = item.quantity * item.unit_price
                    if item.subtotal != expected_subtotal:
                        self.stdout.write(f"   📝 Fixing item subtotal: {item.subtotal} → {expected_subtotal}")
                        item.subtotal = expected_subtotal
                        item.save()
                
                # Calculate total from items
                calculated_total = sum(item.subtotal for item in items)
                self.stdout.write(f"   Calculated total: {calculated_total}")
                
                # Update sale if needed
                if sale.total_amount != calculated_total:
                    self.stdout.write(f"   💾 Updating sale total: {sale.total_amount} → {calculated_total}")
                    sale.total_amount = calculated_total
                    sale.units_sold = sum(item.quantity for item in items)
                    sale.save()
                    fixed_count += 1
                else:
                    self.stdout.write(f"   ✅ Sale total is already correct")
            else:
                self.stdout.write(f"   ⚠️  No items found for this sale")
        
        self.stdout.write(f"\n✅ Fix completed! Updated {fixed_count} sales")
        
        # Show summary
        self.stdout.write("\n📈 Sales Summary After Fix:")
        for sale in Sale.objects.all().order_by('-created_at'):
            items_count = sale.items.count()
            total_qty = sum(item.quantity for item in sale.items.all())
            self.stdout.write(f"   {sale.reference}: {sale.total_amount} DH ({items_count} items, {total_qty} total qty)")
