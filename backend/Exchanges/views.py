from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Q
from .models import Exchange
from .serializers import *
from Pharmacy.models import Pharmacy

class ExchangeCreateView(generics.CreateAPIView):
    serializer_class = ExchangeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            source_pharmacy=self.request.user.pharmacy
        )

class ExchangeListView(generics.ListAPIView):
    serializer_class = ExchangeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_pharmacy = self.request.user.pharmacy
        queryset = Exchange.objects.filter(
            Q(source_pharmacy=user_pharmacy) | 
            Q(dest_pharmacy=user_pharmacy)
        ).order_by('-date')
        
        # Add status filter
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        # Add partner filter
        partner_id = self.request.query_params.get('partner')
        if partner_id:
            queryset = queryset.filter(
                Q(source_pharmacy_id=partner_id) |
                Q(dest_pharmacy_id=partner_id)
            )
            
        return queryset

class ExchangeProcessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            exchange = Exchange.objects.get(pk=pk)
        except Exchange.DoesNotExist:
            return Response({'error': 'Exchange not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if exchange.completed:
            return Response({'error': 'Exchange already processed'}, status=status.HTTP_400_BAD_REQUEST)
        
        if exchange.dest_pharmacy != request.user.pharmacy:
            return Response({'error': 'Unauthorized to process this exchange'}, status=status.HTTP_403_FORBIDDEN)
        
        exchange.process(user=request.user)
        return Response({'status': 'Exchange processed successfully'})

class ExchangeBalanceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        current_pharmacy = request.user.pharmacy
        
        # Get all pharmacies we've had exchanges with
        partner_pharmacies = Pharmacy.objects.filter(
            Q(source_exchanges__dest_pharmacy=current_pharmacy) |
            Q(destination_exchanges__source_pharmacy=current_pharmacy)
        ).distinct()
        
        balance_data = []
        for pharmacy in partner_pharmacies:
            outgoing = Exchange.objects.filter(
                source_pharmacy=current_pharmacy,
                dest_pharmacy=pharmacy,
                completed=True
            ).aggregate(total=Sum('total'))['total'] or 0
            
            incoming = Exchange.objects.filter(
                source_pharmacy=pharmacy,
                dest_pharmacy=current_pharmacy,
                completed=True
            ).aggregate(total=Sum('total'))['total'] or 0
            
            net_balance = outgoing - incoming
            
            balance_data.append({
                'pharmacy_id': pharmacy.id,
                'pharmacy_name': pharmacy.name,
                'outgoing_total': outgoing,
                'incoming_total': incoming,
                'net_balance': net_balance
            })
        
        serializer = ExchangeBalanceSerializer(balance_data, many=True)
        return Response(serializer.data)

class ExchangeHistoryView(generics.ListAPIView):
    serializer_class = ExchangeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        current_pharmacy = self.request.user.pharmacy
        partner_id = self.kwargs.get('pharmacy_id')
        
        return Exchange.objects.filter(
            (Q(source_pharmacy=current_pharmacy) & Q(dest_pharmacy_id=partner_id)) |
            (Q(source_pharmacy_id=partner_id) & Q(dest_pharmacy=current_pharmacy)),
            completed=True
        ).order_by('-date')
class PartnerPharmacyListView(generics.ListAPIView):
    serializer_class = PartnerPharmacySerializer    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        current_pharmacy = self.request.user.pharmacy
        # Get pharmacies we've interacted with
        return Pharmacy.objects.filter(
            Q(source_exchanges__dest_pharmacy=current_pharmacy) |
            Q(destination_exchanges__source_pharmacy=current_pharmacy)
        ).distinct()
class ExchangeActionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk, action):
        try:
            exchange = Exchange.objects.get(pk=pk)
        except Exchange.DoesNotExist:
            return Response({'error': 'Exchange not found'}, status=404)
        
        if action == 'approve':
            if exchange.dest_pharmacy != request.user.pharmacy:
                return Response({'error': 'Unauthorized'}, status=403)
            exchange.approve(user=request.user)
            return Response({'status': 'Exchange approved'})
        
        elif action == 'reject':
            if exchange.dest_pharmacy != request.user.pharmacy:
                return Response({'error': 'Unauthorized'}, status=403)
            reason = request.data.get('reason', '')
            exchange.reject(reason, user=request.user)
            return Response({'status': 'Exchange rejected'})
        
        elif action == 'cancel':
            if exchange.source_pharmacy != request.user.pharmacy:
                return Response({'error': 'Unauthorized'}, status=403)
            if exchange.status == 'PENDING':
                exchange.status = 'CANCELLED'
                exchange.save()
                return Response({'status': 'Exchange cancelled'})
            return Response({'error': 'Cannot cancel non-pending exchange'}, status=400)
        
        return Response({'error': 'Invalid action'}, status=400)