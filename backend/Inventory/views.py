from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import InventoryLog
from .serializers import InventoryLogSerializer
from .permissions import CanManageInventoryLogs
from Pharmacy.models import PharmacyMedicine, Pharmacy
from Medicine.models import Medicine

class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryLog.objects.all()
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAuthenticated, CanManageInventoryLogs]

    @action(detail=False, methods=['post'])
    def add_stock(self, request):
        """Add stock to a medicine"""
        try:
            medicine_id = request.data.get('medicine_id')
            quantity = int(request.data.get('quantity', 0))
            reason = request.data.get('reason', 'MANUAL_ADD')
            
            if quantity <= 0:
                return Response({
                    'error': 'La quantité doit être positive'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the medicine
            medicine = get_object_or_404(Medicine, id=medicine_id)
            
            # Get the default pharmacy (in production, use user's pharmacy)
            pharmacy = Pharmacy.objects.first()
            if not pharmacy:
                return Response({
                    'error': 'Aucune pharmacie trouvée'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create PharmacyMedicine
            pharmacy_medicine, created = PharmacyMedicine.objects.get_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                defaults={
                    'quantity': 0,
                    'price': medicine.prix_public or 50.00,
                    'cost_price': (medicine.prix_public or 50.00) * 0.7,
                    'minimum_stock_level': 20
                }
            )
            
            # Add stock using the model method
            pharmacy_medicine.add_stock(
                amount=quantity,
                user=request.user,
                reason=reason
            )
            
            return Response({
                'message': f'Stock ajouté avec succès: +{quantity} unités',
                'new_stock': pharmacy_medicine.quantity,
                'medicine': medicine.nom
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de l\'ajout du stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def stock_status(self, request):
        """Get stock status for all medicines"""
        try:
            pharmacy = Pharmacy.objects.first()
            if not pharmacy:
                return Response({
                    'error': 'Aucune pharmacie trouvée'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            medicines = PharmacyMedicine.objects.filter(pharmacy=pharmacy)
            
            stock_data = []
            for pm in medicines:
                stock_data.append({
                    'medicine_id': pm.medicine.id,
                    'medicine_name': pm.medicine.nom,
                    'current_stock': pm.quantity,
                    'minimum_level': pm.minimum_stock_level,
                    'status': 'out_of_stock' if pm.quantity == 0 else 
                             'low_stock' if pm.quantity <= pm.minimum_stock_level else 'ok'
                })
            
            return Response({
                'pharmacy': pharmacy.name,
                'total_medicines': medicines.count(),
                'medicines': stock_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la récupération du stock: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
