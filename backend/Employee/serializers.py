from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Employee, EmployeeRole, EmployeeActivityLog
from Authentification.models import PharmacyUser

User = get_user_model()

class EmployeeRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeRole
        fields = '__all__'


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users for employees"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match password.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'password', 'is_active']
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating employees with user accounts"""
    user_data = UserCreateSerializer()
    permissions = serializers.DictField(required=False)
    
    class Meta:
        model = Employee
        fields = [
            'user_data', 'role', 'hire_date', 'employment_status', 'salary',
            'position_title', 'department', 'emergency_contact_name',
            'emergency_contact_phone', 'address', 'custom_permissions_enabled',
            'permissions'
        ]
    
    def create(self, validated_data):
        user_data = validated_data.pop('user_data')
        permissions = validated_data.pop('permissions', {})
        
        # Get the pharmacy from the request user
        pharmacy = self.context['request'].user.pharmacy
        if not pharmacy:
            raise serializers.ValidationError("User must be associated with a pharmacy.")
        
        # Create the user
        user_serializer = UserCreateSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
        else:
            raise serializers.ValidationError(user_serializer.errors)
        
        # Create the employee
        employee = Employee.objects.create(
            user=user,
            pharmacy=pharmacy,
            created_by=self.context['request'].user,
            **validated_data
        )
        
        # Set custom permissions if provided
        if permissions and employee.custom_permissions_enabled:
            for perm, value in permissions.items():
                if hasattr(employee, perm):
                    setattr(employee, perm, value)
            employee.save()
        
        return employee


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating employee information"""
    user_data = UserUpdateSerializer(required=False)
    permissions = serializers.DictField(required=False)
    
    class Meta:
        model = Employee
        fields = [
            'user_data', 'role', 'employment_status', 'salary', 'position_title',
            'department', 'emergency_contact_name', 'emergency_contact_phone',
            'address', 'custom_permissions_enabled', 'permissions'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user_data', None)
        permissions = validated_data.pop('permissions', {})
        
        # Update user data if provided
        if user_data:
            user_serializer = UserUpdateSerializer(instance.user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                raise serializers.ValidationError(user_serializer.errors)
        
        # Update employee data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update custom permissions if provided
        if permissions and instance.custom_permissions_enabled:
            for perm, value in permissions.items():
                if hasattr(instance, perm):
                    setattr(instance, perm, value)
        
        instance.save()
        return instance


class EmployeeSerializer(serializers.ModelSerializer):
    """Full serializer for reading employee data"""
    user = serializers.SerializerMethodField()
    role_name = serializers.CharField(source='role.name', read_only=True)
    permissions = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'user', 'role', 'role_name', 'hire_date',
            'employment_status', 'salary', 'position_title', 'department',
            'emergency_contact_name', 'emergency_contact_phone', 'address',
            'custom_permissions_enabled', 'permissions', 'created_by_name',
            'created_at', 'updated_at', 'last_login'
        ]
    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'phone': obj.user.phone,
            'full_name': obj.user.get_full_name(),
            'is_active': obj.user.is_active,
            'last_login': obj.user.last_login,
        }
    
    def get_permissions(self, obj):
        return obj.get_all_permissions()


class EmployeeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for employee lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'user_name', 'role_name', 'position_title',
            'employment_status', 'hire_date', 'last_login'
        ]


class EmployeeActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for employee activity logs"""
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    
    class Meta:
        model = EmployeeActivityLog
        fields = [
            'id', 'employee', 'employee_name', 'action', 'resource_type',
            'resource_id', 'description', 'ip_address', 'timestamp'
        ]


class EmployeePermissionUpdateSerializer(serializers.Serializer):
    """Serializer for updating employee permissions only"""
    custom_permissions_enabled = serializers.BooleanField()
    permissions = serializers.DictField()
    
    def validate_permissions(self, value):
        valid_permissions = [
            'can_manage_inventory', 'can_manage_sales', 'can_manage_purchases',
            'can_manage_customers', 'can_manage_employees', 'can_manage_suppliers',
            'can_view_reports', 'can_manage_medicines', 'can_view_dashboard',
            'can_manage_exchanges'
        ]
        
        for perm in value.keys():
            if perm not in valid_permissions:
                raise serializers.ValidationError(f"Invalid permission: {perm}")
        
        return value
