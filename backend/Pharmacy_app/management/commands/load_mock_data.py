from django.core.management.base import BaseCommand
from data.mock import create_mock_data

class Command(BaseCommand):
    help = 'Loads mock data into the database'

    def handle(self, *args, **options):
        create_mock_data()
        self.stdout.write(self.style.SUCCESS('Successfully loaded mock data'))