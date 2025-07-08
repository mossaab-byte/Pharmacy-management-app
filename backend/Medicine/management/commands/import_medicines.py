import csv
import os
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand
from django.db import transaction
from Medicine.models import Medicine


class Command(BaseCommand):
    help = 'Import medicines from CSV file into the Medicine model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='data/report.csv',
            help='Path to the CSV file (default: data/report.csv)'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of records to insert in each batch (default: 1000)'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        batch_size = options['batch_size']
        
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return

        self.stdout.write(f'Starting import from {file_path}...')
        
        # Clear existing data
        if self.confirm_clear_data():
            Medicine.objects.all().delete()
            self.stdout.write(
                self.style.SUCCESS('Existing medicine data cleared.')
            )

        medicines_to_create = []
        total_processed = 0
        total_created = 0
        total_skipped = 0

        try:
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    total_processed += 1
                    
                    try:
                        medicine_data = self.process_row(row)
                        if medicine_data:
                            medicines_to_create.append(Medicine(**medicine_data))
                            
                            # Insert in batches
                            if len(medicines_to_create) >= batch_size:
                                created_count = self.bulk_create_medicines(medicines_to_create)
                                total_created += created_count
                                medicines_to_create = []
                                
                                self.stdout.write(
                                    f'Processed {total_processed} rows, created {total_created} medicines...'
                                )
                        else:
                            total_skipped += 1
                            
                    except Exception as e:
                        total_skipped += 1
                        self.stdout.write(
                            self.style.WARNING(
                                f'Skipped row {total_processed}: {str(e)}'
                            )
                        )
                        continue

                # Insert remaining medicines
                if medicines_to_create:
                    created_count = self.bulk_create_medicines(medicines_to_create)
                    total_created += created_count

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error reading CSV file: {str(e)}')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f'Import completed! '
                f'Processed: {total_processed}, '
                f'Created: {total_created}, '
                f'Skipped: {total_skipped}'
            )
        )

    def confirm_clear_data(self):
        """Ask user confirmation before clearing existing data"""
        existing_count = Medicine.objects.count()
        if existing_count > 0:
            confirm = input(
                f'This will delete {existing_count} existing medicines. '
                f'Continue? (yes/no): '
            )
            return confirm.lower() in ['yes', 'y']
        return True

    def process_row(self, row):
        """Process a CSV row and return medicine data dict"""
        try:
            # Handle decimal fields safely
            def safe_decimal(value, default=None):
                if not value or value == '0':
                    return default
                try:
                    return Decimal(str(value))
                except (InvalidOperation, ValueError):
                    return default

            # Clean and validate required fields
            code = str(row.get('code', '')).strip() if row.get('code') is not None else ''
            nom = str(row.get('nom', '')).strip() if row.get('nom') is not None else ''
            dci1 = str(row.get('dci1', '')).strip() if row.get('dci1') is not None else ''
            forme = str(row.get('forme', '')).strip() if row.get('forme') is not None else ''
            presentation = str(row.get('presentation', '')).strip() if row.get('presentation') is not None else ''
            princeps_generique = str(row.get('princeps_generique', '')).strip().upper() if row.get('princeps_generique') is not None else ''

            # Skip if essential fields are missing
            if not all([code, nom, dci1, forme, presentation]):
                return None

            # Validate princeps_generique
            if princeps_generique not in ['P', 'G']:
                princeps_generique = 'P'  # Default to Princeps

            medicine_data = {
                'code': code[:20],  # Truncate to model max_length
                'nom': nom[:100],
                'dci1': dci1[:100],
                'dosage1': str(row.get('dosage1', '')).strip()[:20] if row.get('dosage1') is not None else None,
                'unite_dosage1': str(row.get('unite_dosage1', '')).strip()[:20] if row.get('unite_dosage1') is not None else None,
                'forme': forme[:50],
                'presentation': presentation[:200],
                'ppv': safe_decimal(row.get('ppv')),
                'ph': safe_decimal(row.get('ph')),
                'prix_br': safe_decimal(row.get('prix_br')),
                'princeps_generique': princeps_generique,
                'taux_remboursement': str(row.get('taux_remboursement', '')).strip()[:10] if row.get('taux_remboursement') is not None else None,
                'remise': safe_decimal(row.get('remise')),
                'tva': safe_decimal(row.get('tva')),
                'type': 'A'  # Default type since it's required
            }

            return medicine_data

        except Exception as e:
            raise Exception(f'Error processing row: {str(e)}')

    def bulk_create_medicines(self, medicines_list):
        """Bulk create medicines with error handling"""
        try:
            with transaction.atomic():
                Medicine.objects.bulk_create(medicines_list, ignore_conflicts=True)
                return len(medicines_list)
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'Bulk create error: {str(e)}')
            )
            # Fall back to individual creation
            created_count = 0
            for medicine in medicines_list:
                try:
                    medicine.save()
                    created_count += 1
                except Exception:
                    continue
            return created_count
