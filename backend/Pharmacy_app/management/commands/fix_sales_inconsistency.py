from django.core.management.base import BaseCommand
from Sales.models import Sale
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Fix sales data inconsistency - assign all sales to galvus pharmacy'

    def handle(self, *args, **options):
        User = get_user_model()
        
        try:
            galvus = User.objects.get(username='galvus')
            if not galvus.pharmacy:
                self.stdout.write(self.style.ERROR('Galvus user has no pharmacy!'))
                return
                
            self.stdout.write(f'Galvus pharmacy: {galvus.pharmacy.name}')
            
            # Get all sales not belonging to galvus pharmacy
            other_sales = Sale.objects.exclude(pharmacy=galvus.pharmacy)
            count = other_sales.count()
            
            self.stdout.write(f'Found {count} sales from other pharmacies')
            
            if count > 0:
                # Update all sales to belong to galvus pharmacy
                updated = other_sales.update(pharmacy=galvus.pharmacy)
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Fixed: Updated {updated} sales to {galvus.pharmacy.name}')
                )
            else:
                self.stdout.write(self.style.SUCCESS('✅ No inconsistency found'))
                
            # Verify the fix
            total_sales = Sale.objects.filter(pharmacy=galvus.pharmacy).count()
            self.stdout.write(f'Total sales now in {galvus.pharmacy.name}: {total_sales}')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Galvus user not found!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
