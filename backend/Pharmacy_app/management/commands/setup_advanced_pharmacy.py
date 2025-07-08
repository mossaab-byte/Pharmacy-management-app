# management/commands/setup_advanced_pharmacy.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import uuid
from datetime import date, timedelta

# Import all the models
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Medicine.models import Medicine
from Sales.models import Customer, Sale, SaleItem, Payment
from Purchases.models import Supplier, Purchase, PurchaseItem
from Inventory.models import InventoryLog
from Finance.models import (
    TaxConfiguration, ExpenseCategory, Expense, 
    FinancialReport, BudgetPlan, CashFlowForecast,
    FinancialKPI, TaxCalculation
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up advanced pharmacy management system with sample data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-sample-data',
            action='store_true',
            help='Skip creating sample data',
        )
        parser.add_argument(
            '--pharmacy-name',
            type=str,
            default='Demo Pharmacy',
            help='Name of the demo pharmacy',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up advanced pharmacy management system...'))
        
        # Create admin user if not exists
        admin_user = self.create_admin_user()
        
        # Create demo pharmacy
        pharmacy = self.create_demo_pharmacy(admin_user, options['pharmacy_name'])
        
        if not options['skip_sample_data']:
            # Create sample data
            self.create_sample_medicines()
            self.create_sample_suppliers()
            self.create_sample_customers()
            self.setup_tax_configuration(pharmacy)
            self.setup_expense_categories()
            self.create_sample_transactions(pharmacy)
            self.setup_financial_reports(pharmacy)
            
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up pharmacy management system!\n'
                f'Admin user: admin/admin123\n'
                f'Pharmacy: {pharmacy.name}\n'
                f'Access the application at: http://localhost:8000/'
            )
        )

    def create_admin_user(self):
        """Create an admin user if it doesn't exist"""
        try:
            admin = User.objects.get(username='admin')
            self.stdout.write('Admin user already exists')
        except User.DoesNotExist:
            admin = User.objects.create_user(
                username='admin',
                email='admin@pharmacy.com',
                password='admin123',
                is_pharmacist=True,
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin/admin123'))
        
        return admin

    def create_demo_pharmacy(self, admin_user, name):
        """Create a demo pharmacy"""
        try:
            pharmacy = Pharmacy.objects.get(name=name)
            self.stdout.write(f'Pharmacy "{name}" already exists')
        except Pharmacy.DoesNotExist:
            pharmacy = Pharmacy.objects.create(
                name=name,
                address='123 Main Street, City, Country',
                phone='+1-234-567-8900',
                pharmacist=admin_user
            )
            admin_user.pharmacy = pharmacy
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created pharmacy: {name}'))
        
        return pharmacy

    def create_sample_medicines(self):
        """Create sample medicines"""
        medicines_data = [
            {
                'nom': 'Paracetamol 500mg',
                'code': 'PAR500',
                'dci1': 'Paracetamol',
                'dosage1': '500',
                'unite_dosage1': 'mg',
                'forme': 'Tablet',
                'presentation': 'Box of 20 tablets',
                'prix_br': Decimal('5.50'),
                'ph': Decimal('4.20'),
                'taux_remboursement': Decimal('70.0'),
                'princeps_generique': 'GENERIQUE',
                'type': 'HUMAN'
            },
            {
                'nom': 'Amoxicillin 250mg',
                'code': 'AMX250',
                'dci1': 'Amoxicillin',
                'dosage1': '250',
                'unite_dosage1': 'mg',
                'forme': 'Capsule',
                'presentation': 'Box of 16 capsules',
                'prix_br': Decimal('12.75'),
                'ph': Decimal('9.80'),
                'taux_remboursement': Decimal('65.0'),
                'princeps_generique': 'PRINCEPS',
                'type': 'HUMAN'
            },
            {
                'nom': 'Vitamin C 1000mg',
                'code': 'VITC1000',
                'dci1': 'Ascorbic Acid',
                'dosage1': '1000',
                'unite_dosage1': 'mg',
                'forme': 'Tablet',
                'presentation': 'Box of 30 tablets',
                'prix_br': Decimal('8.90'),
                'ph': Decimal('6.50'),
                'taux_remboursement': Decimal('0.0'),
                'princeps_generique': 'GENERIQUE',
                'type': 'HUMAN'
            }
        ]
        
        created_count = 0
        for med_data in medicines_data:
            medicine, created = Medicine.objects.get_or_create(
                code=med_data['code'],
                defaults=med_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} medicines'))

    def create_sample_suppliers(self):
        """Create sample suppliers"""
        suppliers_data = [
            {
                'name': 'Global Pharma Supplies',
                'contact_person': 'John Smith',
                'phone': '+1-555-0101',
                'email': 'john.smith@globalpha rma.com',
                'address': '456 Industrial Ave, Supply City'
            },
            {
                'name': 'MediCorp Distribution',
                'contact_person': 'Sarah Johnson',
                'phone': '+1-555-0102',
                'email': 'sarah.johnson@medicorp.com',
                'address': '789 Warehouse Blvd, Distribution Hub'
            }
        ]
        
        created_count = 0
        for supplier_data in suppliers_data:
            supplier, created = Supplier.objects.get_or_create(
                name=supplier_data['name'],
                defaults=supplier_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} suppliers'))

    def create_sample_customers(self):
        """Create sample customers"""
        # Create customer users
        customers_data = [
            {
                'username': 'customer1',
                'email': 'customer1@email.com',
                'first_name': 'Alice',
                'last_name': 'Wilson',
                'phone': '+1-555-0201'
            },
            {
                'username': 'customer2',
                'email': 'customer2@email.com',
                'first_name': 'Bob',
                'last_name': 'Davis',
                'phone': '+1-555-0202'
            }
        ]
        
        created_count = 0
        for customer_data in customers_data:
            user, created = User.objects.get_or_create(
                username=customer_data['username'],
                defaults={
                    'email': customer_data['email'],
                    'first_name': customer_data['first_name'],
                    'last_name': customer_data['last_name'],
                    'is_customer': True
                }
            )
            if created:
                user.set_password('customer123')
                user.save()
                
                Customer.objects.get_or_create(
                    user=user,
                    defaults={'phone': customer_data['phone']}
                )
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} customers'))

    def setup_tax_configuration(self, pharmacy):
        """Set up tax configuration"""
        tax_configs = [
            {
                'name': 'Standard VAT',
                'tax_rate': Decimal('0.20'),  # 20%
                'tax_type': 'VAT',
                'effective_from': date.today() - timedelta(days=365)
            },
            {
                'name': 'Prescription Medicine Tax',
                'tax_rate': Decimal('0.05'),  # 5%
                'tax_type': 'GST',
                'effective_from': date.today() - timedelta(days=365)
            }
        ]
        
        created_count = 0
        for tax_data in tax_configs:
            tax_config, created = TaxConfiguration.objects.get_or_create(
                name=tax_data['name'],
                defaults=tax_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} tax configurations'))

    def setup_expense_categories(self):
        """Set up expense categories"""
        categories = [
            'Rent and Utilities',
            'Staff Salaries',
            'Insurance',
            'Marketing and Advertising',
            'Office Supplies',
            'Professional Fees',
            'Maintenance and Repairs',
            'Training and Development'
        ]
        
        created_count = 0
        for category_name in categories:
            category, created = ExpenseCategory.objects.get_or_create(
                name=category_name
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} expense categories'))

    def create_sample_transactions(self, pharmacy):
        """Create sample sales and purchase transactions"""
        # Get some medicines and suppliers
        medicines = Medicine.objects.all()[:3]
        suppliers = Supplier.objects.all()[:2]
        customers = Customer.objects.all()[:2]
        
        if not medicines.exists() or not suppliers.exists():
            self.stdout.write(self.style.WARNING('No medicines or suppliers found. Skipping sample transactions.'))
            return
        
        # Create pharmacy medicines first
        for medicine in medicines:
            PharmacyMedicine.objects.get_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                defaults={
                    'quantity': 100,
                    'price': medicine.prix_br,
                    'cost_price': medicine.ph,
                    'minimum_stock_level': 10
                }
            )
        
        # Create sample sales
        created_sales = 0
        if customers.exists():
            for i, customer in enumerate(customers):
                sale = Sale.objects.create(
                    pharmacy=pharmacy,
                    customer=customer,
                    served_by=pharmacy.pharmacist,
                    units_sold=2 + i
                )
                
                # Add sale items
                for j, medicine in enumerate(medicines[:2]):
                    pharmacy_medicine = PharmacyMedicine.objects.get(
                        pharmacy=pharmacy,
                        medicine=medicine
                    )
                    SaleItem.objects.create(
                        sale=sale,
                        pharmacy_medicine=pharmacy_medicine,
                        quantity=1 + j,
                        unit_price=medicine.prix_br
                    )
                
                sale.finalize()
                created_sales += 1
        
        # Create sample expenses
        created_expenses = 0
        expense_categories = ExpenseCategory.objects.all()[:3]
        for i, category in enumerate(expense_categories):
            Expense.objects.get_or_create(
                pharmacy=pharmacy,
                category=category,
                description=f'Sample {category.name} expense',
                defaults={
                    'amount': Decimal('500.00') * (i + 1),
                    'expense_date': date.today() - timedelta(days=i * 10),
                    'vendor': f'Vendor {i + 1}',
                    'is_approved': True,
                    'status': 'PAID',
                    'created_by': pharmacy.pharmacist
                }
            )
            created_expenses += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'Created {created_sales} sample sales and {created_expenses} sample expenses'
        ))

    def setup_financial_reports(self, pharmacy):
        """Set up initial financial reports"""
        # Create a monthly financial report
        end_date = date.today()
        start_date = end_date.replace(day=1)
        
        report, created = FinancialReport.objects.get_or_create(
            pharmacy=pharmacy,
            report_type='PROFIT_LOSS',
            period_type='MONTHLY',
            start_date=start_date,
            end_date=end_date,
            defaults={
                'generated_by': pharmacy.pharmacist
            }
        )
        
        if created:
            report.generate_profit_loss()
            self.stdout.write(self.style.SUCCESS('Created monthly financial report'))
        
        # Create sample budget
        budget, created = BudgetPlan.objects.get_or_create(
            pharmacy=pharmacy,
            budget_name='Monthly Operating Budget',
            defaults={
                'budget_type': 'EXPENSE',
                'period_start': start_date,
                'period_end': end_date,
                'total_budgeted': Decimal('10000.00'),
                'created_by': pharmacy.pharmacist,
                'is_approved': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created sample budget plan'))
        
        # Create cash flow forecast
        forecast, created = CashFlowForecast.objects.get_or_create(
            pharmacy=pharmacy,
            forecast_date=date.today(),
            defaults={
                'opening_cash_balance': Decimal('25000.00'),
                'projected_sales': Decimal('15000.00'),
                'projected_purchases': Decimal('8000.00'),
                'projected_expenses': Decimal('3000.00'),
                'minimum_cash_required': Decimal('5000.00'),
                'created_by': pharmacy.pharmacist
            }
        )
        
        if created:
            forecast.calculate_forecast()
            self.stdout.write(self.style.SUCCESS('Created cash flow forecast'))

    def create_demo_kpis(self, pharmacy):
        """Create sample KPIs"""
        kpis = [
            {
                'kpi_type': 'GROSS_MARGIN',
                'kpi_value': Decimal('35.5'),
                'target_value': Decimal('40.0'),
                'industry_benchmark': Decimal('38.2')
            },
            {
                'kpi_type': 'INVENTORY_TURNOVER',
                'kpi_value': Decimal('8.2'),
                'target_value': Decimal('10.0'),
                'industry_benchmark': Decimal('9.1')
            }
        ]
        
        created_count = 0
        for kpi_data in kpis:
            kpi, created = FinancialKPI.objects.get_or_create(
                pharmacy=pharmacy,
                kpi_type=kpi_data['kpi_type'],
                period_date=date.today(),
                defaults=kpi_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} KPIs'))
