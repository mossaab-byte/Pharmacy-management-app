from Pharmacy.models import PharmacyMedicine
from Inventory.models import InventoryLog

# Clean all stock
print("Cleaning stock data...")
updated_count = PharmacyMedicine.objects.all().update(quantity=0, units_sold=0)
print(f"Updated {updated_count} medicine records")

deleted_logs = InventoryLog.objects.all().delete()
print(f"Deleted {deleted_logs[0]} inventory logs")

# Add small realistic stock for testing
medicines = PharmacyMedicine.objects.all()[:3]
realistic_quantities = [5, 8, 3]

print("Adding realistic stock...")
for i, pm in enumerate(medicines):
    if i < len(realistic_quantities):
        pm.quantity = realistic_quantities[i]
        pm.save()
        print(f"Added {realistic_quantities[i]} units of {pm.medicine.nom}")

print("Stock cleanup complete!")

# Show final status
current_stock = PharmacyMedicine.objects.filter(quantity__gt=0)
print(f"\nFinal stock status: {current_stock.count()} medicines with stock")
for pm in current_stock:
    print(f"- {pm.medicine.nom}: {pm.quantity} units")
