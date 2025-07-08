from rest_framework import serializers

class KpiSerializer(serializers.Serializer):
    totalRevenue = serializers.FloatField()
    prescriptionsFilled = serializers.IntegerField()
    inventoryValue = serializers.FloatField()
    

class TopProductSerializer(serializers.Serializer):
    productName = serializers.CharField()
    unitsSold = serializers.IntegerField()


class RevenueTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    amount = serializers.FloatField()

class SaleSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_amount = serializers.FloatField()

class InventorySerializer(serializers.Serializer):
    medicine_name = serializers.CharField()
    stock = serializers.IntegerField()
    minimum_stock_level = serializers.IntegerField()
    price = serializers.FloatField()
