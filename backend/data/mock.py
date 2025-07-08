import random
from datetime import date, timedelta
from django.contrib.auth.hashers import make_password
from django.db import transaction
from Authentification.models import User
from Medicine.models import Medicine
from Pharmacy.models import Pharmacy, PharmacyMedicine
from Inventory.models import Inventory
from Sales.models import Customer, Sale, SaleItem, Payment
from Purchases.models import Supplier, Purchase, PurchaseItem
from Exchanges.models import Exchange, ExchangeItem

def create_mock_data():
    # Delete existing data in proper order
    with transaction.atomic():
        print("Deleting old data...")
        ExchangeItem.objects.all().delete()
        Exchange.objects.all().delete()
        Payment.objects.all().delete()
        SaleItem.objects.all().delete()
        Sale.objects.all().delete()
        Customer.objects.all().delete()
        PurchaseItem.objects.all().delete()
        Purchase.objects.all().delete()
        Supplier.objects.all().delete()
        Inventory.objects.all().delete()
        PharmacyMedicine.objects.all().delete()
        Pharmacy.objects.all().delete()
        Medicine.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

    print("Creating new mock data...")
    
    
    # Create Users
    admin_user = User.objects.create(
        username='admin',
        email='admin@pharma.com',
        password=make_password('adminpass'),
        role='admin',
        first_name='Admin',
        last_name='User'
    )

    pharmacist1 = User.objects.create(
        username='pharmacist1',
        email='pharm1@pharma.com',
        password=make_password('pharm1pass'),
        role='pharmacist',
        first_name='John',
        last_name='Pharmacist'
    )

    pharmacist2 = User.objects.create(
        username='pharmacist2',
        email='pharm2@pharma.com',
        password=make_password('pharm2pass'),
        role='pharmacist',
        first_name='Sarah',
        last_name='Druggist'
    )

    manager1 = User.objects.create(
        username='manager1',
        email='manager1@pharma.com',
        password=make_password('manager1pass'),
        role='manager',
        first_name='Mike',
        last_name='Manager',
        pharmacy=None
    )

    client_user = User.objects.create(
        username='client1',
        email='client1@pharma.com',
        password=make_password('clientpass'),
        role='client',
        first_name='Alice',
        last_name='Customer'
    )

    # Create Pharmacies
    pharmacy1 = Pharmacy.objects.create(
        name='City Center Pharmacy',
        address='123 Main St, City Center',
        phone='+1234567890',
        open_hours={'monday': '08:00-20:00', 'tuesday': '08:00-20:00'},
        pharmacist=pharmacist1
    )

    pharmacy2 = Pharmacy.objects.create(
        name='Suburb Health Pharmacy',
        address='456 Oak Ave, Suburbia',
        phone='+0987654321',
        open_hours={'monday': '09:00-19:00', 'sunday': '10:00-16:00'},
        pharmacist=pharmacist2
    )

    # Update manager's pharmacy
    manager1.pharmacy = pharmacy1
    manager1.save()

    # Create Medicines
    med1 = Medicine.objects.create(
        code='MED001',
        nom='Paracetamol',
        dci1='Acetaminophen',
        dosage1='500',
        forme='Tablet',
        presentation='20 tablets',
        ppv=5.99,
        ph=3.50,
        prix_br=4.25,
        princeps_generique='G'
    )

    med2 = Medicine.objects.create(
        code='MED002',
        nom='Ibuprofen',
        dci1='Ibuprofen',
        dosage1='400',
        forme='Capsule',
        presentation='30 capsules',
        ppv=8.50,
        ph=5.00,
        prix_br=6.75,
        princeps_generique='P'
    )

    med3 = Medicine.objects.create(
        code='MED003',
        nom='Amoxicillin',
        dci1='Amoxicillin',
        dosage1='500',
        forme='Capsule',
        presentation='12 capsules',
        ppv=15.99,
        ph=10.50,
        prix_br=12.75,
        princeps_generique='G'
    )

    # Create Pharmacy Medicines
    PharmacyMedicine.objects.create(
        pharmacy=pharmacy1,
        medicine=med1,
        purchase_price=3.00,
        sale_price=5.99,
        quantity=100
    )

    PharmacyMedicine.objects.create(
        pharmacy=pharmacy1,
        medicine=med2,
        purchase_price=4.50,
        sale_price=8.50,
        quantity=50
    )

    PharmacyMedicine.objects.create(
        pharmacy=pharmacy2,
        medicine=med1,
        purchase_price=3.10,
        sale_price=6.20,
        quantity=80
    )

    PharmacyMedicine.objects.create(
        pharmacy=pharmacy2,
        medicine=med3,
        purchase_price=11.00,
        sale_price=16.99,
        quantity=30
    )

    # Create Inventory
    inventory1 = Inventory.objects.create(
        pharmacy=pharmacy1,
        medicine=med1,
        quantity_available=100,
        min_stock=20,
        location='Aisle 3, Shelf B',
        date_exp=date.today() + timedelta(days=365)
    )

    inventory2 = Inventory.objects.create(
        pharmacy=pharmacy1,
        medicine=med2,
        quantity_available=50,
        min_stock=15,
        location='Aisle 2, Shelf A',
        date_exp=date.today() + timedelta(days=180)
    )

    inventory3 = Inventory.objects.create(
        pharmacy=pharmacy2,
        medicine=med1,
        quantity_available=80,
        min_stock=25,
        location='Section 1, Row 4',
        date_exp=date.today() + timedelta(days=300)
    )

    # Create Suppliers
    supplier1 = Supplier.objects.create(
        name='MedSupply Co.',
        credit_amount=0
    )

    supplier2 = Supplier.objects.create(
        name='PharmaDistro Ltd.',
        credit_amount=0
    )

    # Create Purchases
    purchase1 = Purchase.objects.create(
        user=pharmacist1,
        pharmacy=pharmacy1,
        supplier=supplier1,
        num_BL=1001,
        total=0,
        amount_paid=150.00,
        status='completed'
    )

    # Create Purchase Items
    item1 = PurchaseItem.objects.create(
        purchase=purchase1,
        medicine=med1,
        quantity=50,
        price=3.00
    )

    item2 = PurchaseItem.objects.create(
        purchase=purchase1,
        medicine=med2,
        quantity=30,
        price=4.50
    )

    # Update purchase total
    purchase1.total = item1.quantity * item1.price + item2.quantity * item2.price
    purchase1.save()

    # Create Customers
    customer1 = Customer.objects.create(
        name='Alice Johnson',
        user=client_user,
        pharmacy=pharmacy1,
        credit_amount=120.50,
        paid_amount=80.00,
        credit_limit=200.00
    )

    customer2 = Customer.objects.create(
        name='Bob Smith',
        user=None,
        pharmacy=pharmacy1,
        credit_amount=75.00,
        paid_amount=75.00,
        credit_limit=150.00
    )

    # Create Sales
    sale1 = Sale.objects.create(
        user=manager1,
        pharmacy=pharmacy1,
        customer_type='registered',
        customer=customer1,
        total=0,
        amount_paid=25.00,
        status='completed'
    )

    sale2 = Sale.objects.create(
        user=pharmacist1,
        pharmacy=pharmacy1,
        customer_type='walk_in',
        customer=None,
        total=0,
        amount_paid=34.00,
        status='completed'
    )

    # Create Sale Items
    sale_item1 = SaleItem.objects.create(
        sale=sale1,
        medicine=med1,
        quantity=5,
        price=med1.ppv
    )

    sale_item2 = SaleItem.objects.create(
        sale=sale1,
        medicine=med2,
        quantity=2,
        price=med2.ppv
    )

    sale_item3 = SaleItem.objects.create(
        sale=sale2,
        medicine=med1,
        quantity=3,
        price=med1.ppv
    )

    # Update sale totals
    sale1.total = sale_item1.quantity * sale_item1.price + sale_item2.quantity * sale_item2.price
    sale1.save()
    sale2.total = sale_item3.quantity * sale_item3.price
    sale2.save()

    # Create Payments
    payment1 = Payment.objects.create(
        customer=customer1,
        amount=40.50
    )

    # Create Exchange
    exchange1 = Exchange.objects.create(
        user=pharmacist1,
        direction='OUT',
        payment_type='transfer',
        source=pharmacy1,
        destination=pharmacy2,
        total=0,
        completed=True
    )

    # Create Exchange Items
    exch_item1 = ExchangeItem.objects.create(
        exchange=exchange1,
        medicine=med1,
        quantity=10
    )

    exch_item2 = ExchangeItem.objects.create(
        exchange=exchange1,
        medicine=med2,
        quantity=5
    )

    # Update exchange total
    exchange1.total = (
        exch_item1.quantity * PharmacyMedicine.objects.get(pharmacy=pharmacy1, medicine=med1).sale_price +
        exch_item2.quantity * PharmacyMedicine.objects.get(pharmacy=pharmacy1, medicine=med2).sale_price
    )
    exchange1.save()

    print("Mock data created successfully!")

# Execute the function
create_mock_data()