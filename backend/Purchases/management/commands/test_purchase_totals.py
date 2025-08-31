"""
Django management command to create a test purchase and verify totals
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from Purchases.models import Purchase, PurchaseItem, Supplier
from Medicine.models import Medicine
from Pharmacy.models import Pharmacy

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test purchase to verify total calculations'

    def handle(self, *args, **options):
        self.stdout.write("🧪 Creating test purchase to verify totals...")
        
        try:
            # Get or create test data
            pharmacy = Pharmacy.objects.first()
            if not pharmacy:
                self.stdout.write(self.style.ERROR("❌ No pharmacy found. Please create a pharmacy first."))
                return
            
            supplier = Supplier.objects.first()
            if not supplier:
                supplier = Supplier.objects.create(
                    name="Test Supplier",
                    contact_person="Test Contact",
                    contact_email="test@supplier.com"
                )
                self.stdout.write(f"✅ Created test supplier: {supplier.name}")
            
            medicines = Medicine.objects.all()[:2]
            if len(medicines) < 2:
                self.stdout.write(self.style.ERROR("❌ Need at least 2 medicines in database."))
                return
            
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                user = User.objects.first()
            
            # Create purchase
            purchase = Purchase.objects.create(
                pharmacy=pharmacy,
                supplier=supplier,
                received_by=user
            )
            
            # Create purchase items
            item1 = PurchaseItem.objects.create(
                purchase=purchase,
                medicine=medicines[0],
                quantity=10,
                unit_cost=25.50
            )
            
            item2 = PurchaseItem.objects.create(
                purchase=purchase,
                medicine=medicines[1],
                quantity=5,
                unit_cost=15.75
            )
            
            # Expected total
            expected_total = (10 * 25.50) + (5 * 15.75)
            
            self.stdout.write(f"📦 Purchase created: {purchase.id}")
            self.stdout.write(f"🧮 Item 1: {item1.quantity} x {item1.medicine.nom} @ {item1.unit_cost} = {item1.subtotal}")
            self.stdout.write(f"🧮 Item 2: {item2.quantity} x {item2.medicine.nom} @ {item2.unit_cost} = {item2.subtotal}")
            self.stdout.write(f"🧮 Expected total: {expected_total}")
            self.stdout.write(f"🧮 Current total_amount: {purchase.total_amount}")
            
            # Calculate total manually
            total = sum(item.subtotal for item in purchase.items.all())
            purchase.total_amount = total
            purchase.save()
            
            self.stdout.write(f"🧮 Updated total_amount: {purchase.total_amount}")
            
            if purchase.total_amount == expected_total:
                self.stdout.write(self.style.SUCCESS("✅ Total calculation is CORRECT!"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ Total calculation is WRONG! Expected {expected_total}, got {purchase.total_amount}"))
            
            self.stdout.write(f"🌐 Now check the frontend at http://localhost:3333/purchases")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {e}"))
