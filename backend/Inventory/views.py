from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import InventoryLog
from .serializers import InventoryLogSerializer
from .permissions import CanManageInventoryLogs

class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryLog.objects.all()
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAuthenticated, CanManageInventoryLogs]
