import csv
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand
from django.db import connection
from Medicine.models import Medicine


class Command(BaseCommand):
    help = 'Import medicines from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str)

    def reset_pk_sequence(self, model):
        with connection.cursor() as cursor:
            table_name = model._meta.db_table
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table_name}'")

    def clean_numeric_field(self, value, field_name):
        if not value or value.strip() == '':
            return None
        cleaned = str(value).strip()
        if field_name == 'code':
            # Keep code as string to preserve any leading zeros or alphanumerics
            return cleaned
        elif field_name in ['ppv', 'ph', 'prix_br']:
            try:
                return Decimal(cleaned)
            except InvalidOperation:
                self.stderr.write(f"Warning: Invalid decimal {field_name} value: {value}")
                return None
        elif field_name == 'dosage1':
            # Dosage could be complex strings, so keep as is
            return cleaned
        else:
            return cleaned

    def handle(self, *args, **options):
        path = options['csv_path']
        Medicine.objects.all().delete()
        self.reset_pk_sequence(Medicine)

        with open(path, encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            count = 0
            for row_num, row in enumerate(reader, 1):
                # Clean column names
                row = {k.strip(): v.strip() if isinstance(v, str) else v 
                       for k, v in row.items()}

                # Remove ID if present
                row.pop('id', None)

                # Clean taux_remboursement
                taux = row.get('taux_remboursement')
                if taux:
                    row['taux_remboursement'] = taux.replace('%', '').strip()

                # Validate required fields
                code = row.get('code')
                if not code:
                    self.stderr.write(f"Row {row_num}: Skipping - missing 'code': {row}")
                    continue

                # Convert numeric fields
                numeric_fields = ['code', 'dosage1', 'ppv', 'ph', 'prix_br']
                for field in numeric_fields:
                    if field in row:
                        row[field] = self.clean_numeric_field(row[field], field)

                # Handle empty strings for optional fields
                for key, value in row.items():
                    if value == '' or value is None:
                        row[key] = None

                try:
                    Medicine.objects.create(**row)
                    count += 1
                    if count % 100 == 0:
                        self.stdout.write(f"Processed {count} records...")
                except Exception as e:
                    self.stderr.write(f"Row {row_num}: Error inserting - {e}")
                    self.stderr.write(f"Data: {row}")
                    continue

        self.stdout.write(
            self.style.SUCCESS(f"Import completed: {count} records inserted.")
        )