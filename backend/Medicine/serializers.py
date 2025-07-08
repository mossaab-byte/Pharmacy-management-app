from rest_framework import serializers
from .models import *
class MedicineSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nom')
    public_price = serializers.DecimalField(source='prix_br', max_digits=8, decimal_places=2)
    cost_price = serializers.DecimalField(source='ph', max_digits=8, decimal_places=2, required=False)
    form = serializers.CharField(source='forme')
    presentation = serializers.CharField()
    type = serializers.CharField(source='get_type_display')
    princeps_generique = serializers.CharField(source='get_princeps_generique_display')
    
    class Meta:
        model = Medicine
        fields = [
            'id', 'code', 'name', 'dci1', 'dosage1', 'unite_dosage1',
            'form', 'presentation', 'public_price', 'cost_price',
            'princeps_generique', 'taux_remboursement', 'remise', 'tva', 'type'
        ]
        read_only_fields = fields