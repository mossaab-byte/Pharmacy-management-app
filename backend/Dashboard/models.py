# models.py

from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)  # simplify, could be FK to Category model

class PharmacyInventory(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)

class Sale(models.Model):
    date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    units_sold = models.PositiveIntegerField()
    revenue = models.DecimalField(max_digits=10, decimal_places=2)
