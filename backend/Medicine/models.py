from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
# Create your models here.
# medicaments/models.py
from django.db import models
from django.core.validators import MinValueValidator
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from django.contrib.auth.models import User


class Medicine(models.Model):
    PRINCEPS_CHOICES = [
        ('P', 'Princeps'),
        ('G', 'Générique'),
    ]
    TYPES = [
        ('A','TypeA'),
        ('B','TypeB')
    ]
   

    
    code = models.CharField(max_length=20, unique=False, db_index=True)  # Added index for barcode search
    nom = models.CharField(max_length=100, db_index=True)
    dci1 = models.CharField(max_length=100, db_index=True)  # Added index for search
    dosage1 = models.CharField(max_length=20, null=True, blank=True)
   
    unite_dosage1 = models.CharField(max_length=20, null=True, blank=True)
    
    forme = models.CharField(max_length=50)
    presentation = models.CharField(max_length=200)
    ppv = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    ph = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    prix_br = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    princeps_generique = models.CharField(max_length=1, choices=PRINCEPS_CHOICES)    
    taux_remboursement = models.CharField(max_length=10, null=True, blank=True)
    remise = models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True)
    tva = models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True)
    type = models.CharField(max_length=1, choices=TYPES)

    class Meta:
        verbose_name = "Médicament"
        verbose_name_plural = "Médicaments"
        indexes = [
            models.Index(fields=['nom'], name='medicine_nom_idx'),
            models.Index(fields=['code'], name='medicine_code_idx'),
            models.Index(fields=['dci1'], name='medicine_dci1_idx'),
            models.Index(fields=['nom', 'code'], name='medicine_search_idx'),
        ]   
    def __str__(self):  
        return f"{self.id} - {self.nom}"
    #7 types de medicaments : x=> ph
    #x<166
    #166<x<588
    #588<x<1756 +300 
    #x>1756 +400 
    #1,5 * x para et complement 
    #%0,85 * x lait