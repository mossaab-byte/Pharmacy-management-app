"""
Management command to create default employee roles
"""
from django.core.management.base import BaseCommand
from Employee.models import EmployeeRole


class Command(BaseCommand):
    help = 'Create default employee roles'

    def handle(self, *args, **options):
        # Default roles with their permissions
        default_roles = [
            {
                'name': 'Manager',
                'description': 'Full management access to all pharmacy operations',
                'can_manage_medicines': True,
                'can_manage_inventory': True,
                'can_manage_sales': True,
                'can_manage_purchases': True,
                'can_manage_customers': True,
                'can_manage_suppliers': True,
                'can_view_dashboard': True,
                'can_view_reports': True,
                'can_manage_exchanges': True,
                'can_manage_employees': True,
            },
            {
                'name': 'Sales Assistant',
                'description': 'Can handle sales and customer management',
                'can_manage_medicines': False,
                'can_manage_inventory': False,
                'can_manage_sales': True,
                'can_manage_purchases': False,
                'can_manage_customers': True,
                'can_manage_suppliers': False,
                'can_view_dashboard': True,
                'can_view_reports': False,
                'can_manage_exchanges': False,
                'can_manage_employees': False,
            },
            {
                'name': 'Inventory Clerk',
                'description': 'Manages inventory and medicine stock',
                'can_manage_medicines': True,
                'can_manage_inventory': True,
                'can_manage_sales': False,
                'can_manage_purchases': True,
                'can_manage_customers': False,
                'can_manage_suppliers': True,
                'can_view_dashboard': True,
                'can_view_reports': True,
                'can_manage_exchanges': True,
                'can_manage_employees': False,
            },
            {
                'name': 'Pharmacist Assistant',
                'description': 'Basic access to sales and inventory viewing',
                'can_manage_medicines': False,
                'can_manage_inventory': False,
                'can_manage_sales': True,
                'can_manage_purchases': False,
                'can_manage_customers': False,
                'can_manage_suppliers': False,
                'can_view_dashboard': True,
                'can_view_reports': False,
                'can_manage_exchanges': False,
                'can_manage_employees': False,
            },
        ]

        created_count = 0
        for role_data in default_roles:
            role, created = EmployeeRole.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created role: {role.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Role already exists: {role.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new roles')
        )
