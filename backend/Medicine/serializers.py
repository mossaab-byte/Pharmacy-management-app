from rest_framework import serializers
from .models import *
class MedicineSerializer(serializers.ModelSerializer):
    # Keep original field names for compatibility
    name = serializers.CharField(source='nom')
    public_price = serializers.DecimalField(source='prix_br', max_digits=8, decimal_places=2)
    cost_price = serializers.DecimalField(source='ph', max_digits=8, decimal_places=2, required=False)
    form = serializers.CharField(source='forme')
    presentation = serializers.CharField()
    type = serializers.CharField(source='get_type_display')
    princeps_generique = serializers.CharField(source='get_princeps_generique_display')
    
    # Add frontend-expected field names
    nom = serializers.CharField()
    prix_public = serializers.DecimalField(source='prix_br', max_digits=8, decimal_places=2)
    nom_commercial = serializers.CharField(source='nom')  # Use nom as commercial name
    stock = serializers.SerializerMethodField()  # Add mock stock for now
    
    def get_stock(self, obj):
        # Return a mock stock value for now (in production, this would come from inventory)
        return 10
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'code', 'name', 'dci1', 'dosage1', 'unite_dosage1',
            'form', 'presentation', 'public_price', 'cost_price',
            'princeps_generique', 'taux_remboursement', 'remise', 'tva', 'type',
            # Add frontend-expected fields
            'nom', 'prix_public', 'nom_commercial', 'forme', 'stock'
        ]
        read_only_fields = fields