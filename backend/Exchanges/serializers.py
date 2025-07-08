from rest_framework import serializers
from .models import Exchange, ExchangeItem
from Pharmacy.models import Pharmacy
from Medicine.models import Medicine

class ExchangeItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ExchangeItem
        fields = ['id', 'medicine', 'medicine_name', 'quantity', 'total_price']
        extra_kwargs = {'medicine': {'required': True}}

class ExchangeSerializer(serializers.ModelSerializer):
    items = ExchangeItemSerializer(many=True)
    source_pharmacy_name = serializers.CharField(source='source_pharmacy.name', read_only=True)
    dest_pharmacy_name = serializers.CharField(source='dest_pharmacy.name', read_only=True)
    direction_display = serializers.CharField(source='get_direction_display', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = Exchange
        fields = [
            'id', 'user', 'user_name', 'direction', 'direction_display',
            'payment_type', 'source_pharmacy', 'source_pharmacy_name',
            'dest_pharmacy', 'dest_pharmacy_name', 'date', 'total',
            'completed', 'items'
        ]
        read_only_fields = [
            'id', 'user', 'date', 'total', 'completed', 'direction',
            'source_pharmacy', 'source_pharmacy_name', 'dest_pharmacy_name'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        exchange = Exchange.objects.create(
            **validated_data,
            source_pharmacy=self.context['request'].user.pharmacy,
            direction='OUT'
        )
        
        for item_data in items_data:
            ExchangeItem.objects.create(exchange=exchange, **item_data)
        
        exchange.update_total()
        return exchange

class ExchangeBalanceSerializer(serializers.Serializer):
    pharmacy_id = serializers.UUIDField()
    pharmacy_name = serializers.CharField()
    outgoing_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    incoming_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
class PartnerPharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'address', 'phone']