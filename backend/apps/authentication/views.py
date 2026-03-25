from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # In JWT, logout is usually handled by the client by deleting the token.
        # However, we can implement a blacklist if configured.
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
