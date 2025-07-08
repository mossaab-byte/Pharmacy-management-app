# Authentication/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from Pharmacy.serializers import PharmacySerializer
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken


class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'is_pharmacist': user.is_pharmacist,
                    'is_manager': user.is_manager,
                    'is_customer': user.is_customer,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Registration failed',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class RegisterPharmacyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Pass request context to serializer
            serializer = PharmacyRegisterSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            pharmacy = serializer.save()
            
            return Response({
                "success": True,
                "message": "Pharmacy created successfully",
                "pharmacy": {
                    "id": str(pharmacy.id),
                    "name": pharmacy.name,
                    "address": pharmacy.address,
                    "phone": pharmacy.phone,
                    "created_at": pharmacy.created_at
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Pharmacy registration failed',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_pharmacist': user.is_pharmacist,
            'is_manager': user.is_manager,
            'is_customer': user.is_customer,
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or token not provided"}, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
