from django.core.management.base import BaseCommand
from django.core.management import call_command
import os


class Command(BaseCommand):
    help = 'Reset database and apply all migrations'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting database reset...'))
        
        # Remove the database file
        db_path = 'db.sqlite3'
        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write(self.style.SUCCESS(f'Removed {db_path}'))
        
        # Make migrations
        self.stdout.write(self.style.WARNING('Creating migrations...'))
        call_command('makemigrations')
        
        # Apply migrations
        self.stdout.write(self.style.WARNING('Applying migrations...'))
        call_command('migrate')
        
        # Create superuser prompt
        self.stdout.write(self.style.SUCCESS('Database reset complete!'))
        self.stdout.write(self.style.WARNING('You may want to create a superuser:'))
        self.stdout.write('python manage.py createsuperuser')
