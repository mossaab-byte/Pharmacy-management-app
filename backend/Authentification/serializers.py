# Authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from Pharmacy.models import Pharmacy
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
PharmacyUser = get_user_model()
import logging
logger = logging.getLogger(__name__)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = PharmacyUser
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')  # remove before creating user
        user = PharmacyUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.is_pharmacist = True  # Automatically pharmacist
        user.save()
        return user


class PharmacyRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = ['name', 'address', 'phone']  # Only include fields that exist in the model
    
    def create(self, validated_data):
        # Get the authenticated user from request context
        pharmacist = self.context['request'].user
        
        # Create pharmacy with pharmacist relationship
        pharmacy = Pharmacy.objects.create(pharmacist=pharmacist, **validated_data)
        
        # CRITICAL FIX: Also update the user's pharmacy field
        pharmacist.pharmacy = pharmacy
        pharmacist.is_pharmacist = True  # Ensure they have pharmacist permissions
        pharmacist.save()
        
        return pharmacy



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("New password must be at least 8 characters long")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        try:
            data.update({
                'user_id': str(user.id),
                'username': user.username,
                'is_pharmacist': user.is_pharmacist,
                'is_manager': user.is_manager,
                'is_customer': user.is_customer,
                'pharmacy_name': user.pharmacy.name if user.pharmacy else None,
                'pharmacy_id': str(user.pharmacy.id) if user.pharmacy else None,
            })
        except Exception as e:
            logger.error(f"Error in MyTokenObtainPairSerializer.validate: {e}")
            raise
        return data

class PharmacyUserSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = PharmacyUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'is_pharmacist', 'is_manager', 'is_customer', 'pharmacy', 'pharmacy_name',
            'can_manage_inventory', 'can_manage_sales', 'can_manage_purchases', 
            'can_manage_users', 'can_view_reports'
        ]
        read_only_fields = ['id', 'pharmacy_name']

class UserPermissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyUser
        fields = [
            'can_manage_inventory', 'can_manage_sales', 'can_manage_purchases', 
            'can_manage_users', 'can_view_reports'
        ]