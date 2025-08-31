from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Employee, EmployeeRole, EmployeeActivityLog
from .serializers import (
    EmployeeSerializer, EmployeeCreateSerializer, EmployeeUpdateSerializer,
    EmployeeListSerializer, EmployeeRoleSerializer, EmployeeActivityLogSerializer,
    EmployeePermissionUpdateSerializer
)

User = get_user_model()

class EmployeePermissions(permissions.BasePermission):
    """Custom permission class for employee management"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Pharmacists can always manage employees
        if request.user.is_pharmacist:
            return True
        
        # Check if user has employee management permissions
        if hasattr(request.user, 'employee_profile'):
            employee = request.user.employee_profile
            return employee.get_permission('can_manage_employees')
        
        return False


class EmployeeRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employee roles"""
    serializer_class = EmployeeRoleSerializer
    permission_classes = [permissions.IsAuthenticated, EmployeePermissions]
    
    def get_queryset(self):
        return EmployeeRole.objects.all()


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employees"""
    permission_classes = [permissions.IsAuthenticated, EmployeePermissions]
    
    def get_queryset(self):
        user = self.request.user
        
        # Pharmacists see all employees in their pharmacy
        if user.is_pharmacist and user.pharmacy:
            return Employee.objects.filter(pharmacy=user.pharmacy)
        
        # Employees with management permissions see other employees
        if hasattr(user, 'employee_profile'):
            employee = user.employee_profile
            if employee.get_permission('can_manage_employees'):
                return Employee.objects.filter(pharmacy=employee.pharmacy)
        
        return Employee.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return EmployeeUpdateSerializer
        elif self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def perform_create(self, serializer):
        """Override to set created_by"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_permissions(self, request, pk=None):
        """Update employee permissions"""
        employee = self.get_object()
        serializer = EmployeePermissionUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            custom_enabled = serializer.validated_data['custom_permissions_enabled']
            permissions = serializer.validated_data['permissions']
            
            employee.custom_permissions_enabled = custom_enabled
            
            if custom_enabled:
                for perm, value in permissions.items():
                    setattr(employee, perm, value)
            
            employee.save()
            
            # Log the permission change
            EmployeeActivityLog.objects.create(
                employee=employee,
                action='permission_change',
                description=f"Permissions updated by {request.user.username}",
                ip_address=self.get_client_ip(request)
            )
            
            return Response({'detail': 'Permissions updated successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change employee status"""
        employee = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['active', 'inactive', 'suspended', 'terminated']:
            return Response(
                {'detail': 'Invalid status. Must be one of: active, inactive, suspended, terminated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = employee.employment_status
        employee.employment_status = new_status
        
        # Deactivate user account if status is not active
        if new_status != 'active':
            employee.user.is_active = False
        else:
            employee.user.is_active = True
        
        employee.user.save()
        employee.save()
        
        # Log the status change
        EmployeeActivityLog.objects.create(
            employee=employee,
            action='status_change',
            description=f"Status changed from {old_status} to {new_status} by {request.user.username}",
            ip_address=self.get_client_ip(request)
        )
        
        return Response({'detail': f'Employee status changed to {new_status}'})
    
    @action(detail=True, methods=['get'])
    def activity_logs(self, request, pk=None):
        """Get employee activity logs"""
        employee = self.get_object()
        logs = EmployeeActivityLog.objects.filter(employee=employee)[:50]  # Last 50 activities
        serializer = EmployeeActivityLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Get all available employee roles"""
        roles = EmployeeRole.objects.all()
        serializer = EmployeeRoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get employee statistics for the pharmacy"""
        user = request.user
        pharmacy = user.pharmacy
        
        if not pharmacy:
            return Response({'detail': 'User not associated with a pharmacy'}, status=400)
        
        employees = Employee.objects.filter(pharmacy=pharmacy)
        
        stats = {
            'total_employees': employees.count(),
            'active_employees': employees.filter(employment_status='active').count(),
            'inactive_employees': employees.filter(employment_status='inactive').count(),
            'suspended_employees': employees.filter(employment_status='suspended').count(),
            'terminated_employees': employees.filter(employment_status='terminated').count(),
            'by_role': {},
            'recent_activities': []
        }
        
        # Count by role
        for role in EmployeeRole.objects.all():
            count = employees.filter(role=role).count()
            if count > 0:
                stats['by_role'][role.name] = count
        
        # Recent activities
        recent_logs = EmployeeActivityLog.objects.filter(
            employee__pharmacy=pharmacy
        ).order_by('-timestamp')[:10]
        
        stats['recent_activities'] = EmployeeActivityLogSerializer(recent_logs, many=True).data
        
        return Response(stats)
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Utility function to log employee activities
def log_employee_activity(user, action, resource_type='', resource_id='', description='', request=None):
    """Helper function to log employee activities"""
    if hasattr(user, 'employee_profile'):
        employee = user.employee_profile
        
        log_data = {
            'employee': employee,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'description': description,
        }
        
        if request:
            log_data['ip_address'] = get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        EmployeeActivityLog.objects.create(**log_data)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
