# Medicine/views.py
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Min, Max
from .models import Medicine
from .serializers import MedicineSerializer
from .permissions import IsAdminOnly

class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for medicines - no create/update/delete allowed
    Supports barcode scanning and advanced search features
    """
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous access for read-only operations
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Search across key fields including code for barcode scanning
    search_fields = ['nom', 'dci1', 'code', 'forme', 'presentation']
    
    # Filter by common fields
    filterset_fields = ['forme', 'princeps_generique', 'type']
    
    # Allow ordering
    ordering_fields = ['nom', 'prix_br', 'ppv', 'code']
    ordering = ['nom']

    @action(detail=False, methods=['get'])
    def search_by_code(self, request):
        """Search medicine by exact code (for barcode scanning)"""
        code = request.query_params.get('code', '').strip()
        if not code:
            return Response({'error': 'Code parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            medicine = Medicine.objects.get(code=code)
            serializer = self.get_serializer(medicine)
            return Response({
                'found': True,
                'medicine': serializer.data
            })
        except Medicine.DoesNotExist:
            return Response({
                'found': False,
                'message': f'Medicine with code {code} not found'
            })

    @action(detail=False, methods=['get'])
    def quick_search(self, request):
        """Quick search for medicines by name or code (for autocomplete)"""
        query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 10))
        
        if not query:
            return Response([])
        
        medicines = Medicine.objects.filter(
            Q(nom__icontains=query) | 
            Q(code__icontains=query) |
            Q(dci1__icontains=query)
        )[:limit]
        
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get medicine database statistics"""
        stats = {
            'total_medicines': self.queryset.count(),
            'by_type': {
                'princeps': self.queryset.filter(princeps_generique='P').count(),
                'generic': self.queryset.filter(princeps_generique='G').count(),
            },
            'forms_count': self.queryset.values('forme').distinct().count(),
            'price_range': {
                'min': self.queryset.aggregate(min_price=Min('prix_br'))['min_price'],
                'max': self.queryset.aggregate(max_price=Max('prix_br'))['max_price'],
            }
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def search_all(self, request):
        """Return all medicines for frontend search (no pagination)"""
        # Get all medicines with basic info for frontend search
        medicines = Medicine.objects.all().order_by('nom')
        
        # Apply search filter if provided
        search = request.query_params.get('search', '').strip()
        if search:
            medicines = medicines.filter(
                Q(nom__icontains=search) | 
                Q(code__icontains=search) |
                Q(dci1__icontains=search)
            )
        
        # Limit to prevent huge responses but allow enough for search
        limit = int(request.query_params.get('limit', 1000))
        medicines = medicines[:limit]
        
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

# Keep the old view for backward compatibility
class MedicineListView(viewsets.ReadOnlyModelViewSet):
    queryset = Medicine.objects.all().order_by('nom')
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'code']
