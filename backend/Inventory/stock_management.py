from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from Pharmacy.models import PharmacyMedicine
from Inventory.models import InventoryLog
from django.shortcuts import get_object_or_404
from decimal import Decimal

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_stock(request, pharmacy_medicine_id):
    """
    Add stock to a pharmacy medicine. 
    Only pharmacists and managers can add stock.
    """
    try:
        # Check permissions
        user = request.user
        if not (user.is_pharmacist or user.is_manager):
            return Response({
                'error': True,
                'message': 'Permission denied. Only pharmacists and managers can add stock.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the pharmacy medicine
        pharmacy_medicine = get_object_or_404(PharmacyMedicine, id=pharmacy_medicine_id)
        
        # Check if user belongs to the same pharmacy
        if user.pharmacy != pharmacy_medicine.pharmacy:
            return Response({
                'error': True,
                'message': 'You can only manage stock for your own pharmacy.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get quantity from request
        quantity = request.data.get('quantity', 0)
        reason = request.data.get('reason', 'MANUAL_ADD')
        cost_price = request.data.get('cost_price', pharmacy_medicine.cost_price)
        
        try:
            quantity = Decimal(str(quantity))
            if quantity <= 0:
                return Response({
                    'error': True,
                    'message': 'Quantity must be positive.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                'error': True,
                'message': 'Invalid quantity format.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update stock
        old_quantity = pharmacy_medicine.quantity
        pharmacy_medicine.quantity += quantity
        
        # Update cost price if provided
        if cost_price:
            try:
                pharmacy_medicine.cost_price = Decimal(str(cost_price))
            except (ValueError, TypeError):
                pass
        
        pharmacy_medicine.save()
        
        # Create inventory log
        InventoryLog.objects.create(
            pharmacy_medicine=pharmacy_medicine,
            action='IN',
            quantity=quantity,
            reason=reason,
            user=user,
            notes=f'Manual stock addition by {user.username}'
        )
        
        return Response({
            'success': True,
            'message': f'Successfully added {quantity} units to stock.',
            'data': {
                'pharmacy_medicine_id': pharmacy_medicine.id,
                'medicine_name': pharmacy_medicine.medicine.nom,
                'old_quantity': float(old_quantity),
                'new_quantity': float(pharmacy_medicine.quantity),
                'added_quantity': float(quantity)
            }
        })
        
    except Exception as e:
        return Response({
            'error': True,
            'message': f'Error adding stock: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    """
    Get current user's permissions for stock management
    """
    user = request.user
    
    return Response({
        'user_id': user.id,
        'username': user.username,
        'is_pharmacist': user.is_pharmacist,
        'is_manager': user.is_manager,
        'can_manage_stock': user.is_pharmacist or user.is_manager,
        'pharmacy_id': user.pharmacy.id if user.pharmacy else None,
        'pharmacy_name': user.pharmacy.name if user.pharmacy else None
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reduce_stock(request, pharmacy_medicine_id):
    """
    Reduce stock from a pharmacy medicine.
    Used for sales, damages, etc.
    """
    try:
        user = request.user
        if not (user.is_pharmacist or user.is_manager):
            return Response({
                'error': True,
                'message': 'Permission denied.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        pharmacy_medicine = get_object_or_404(PharmacyMedicine, id=pharmacy_medicine_id)
        
        if user.pharmacy != pharmacy_medicine.pharmacy:
            return Response({
                'error': True,
                'message': 'You can only manage stock for your own pharmacy.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        quantity = Decimal(str(request.data.get('quantity', 0)))
        reason = request.data.get('reason', 'MANUAL_REDUCE')
        
        if quantity <= 0:
            return Response({
                'error': True,
                'message': 'Quantity must be positive.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if pharmacy_medicine.quantity < quantity:
            return Response({
                'error': True,
                'message': f'Insufficient stock. Available: {pharmacy_medicine.quantity}, Requested: {quantity}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update stock
        old_quantity = pharmacy_medicine.quantity
        pharmacy_medicine.quantity -= quantity
        pharmacy_medicine.save()
        
        # Create inventory log
        InventoryLog.objects.create(
            pharmacy_medicine=pharmacy_medicine,
            action='OUT',
            quantity=quantity,
            reason=reason,
            user=user,
            notes=f'Manual stock reduction by {user.username}'
        )
        
        return Response({
            'success': True,
            'message': f'Successfully reduced {quantity} units from stock.',
            'data': {
                'pharmacy_medicine_id': pharmacy_medicine.id,
                'medicine_name': pharmacy_medicine.medicine.nom,
                'old_quantity': float(old_quantity),
                'new_quantity': float(pharmacy_medicine.quantity),
                'reduced_quantity': float(quantity)
            }
        })
        
    except Exception as e:
        return Response({
            'error': True,
            'message': f'Error reducing stock: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
