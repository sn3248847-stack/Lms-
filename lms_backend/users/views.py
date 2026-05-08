from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import RegisterSerializer, UserSerializer, AdminUserCreateSerializer, ChangePasswordSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "password": getattr(user, '_generated_password', None)
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return User.objects.all()
        return User.objects.none()

    def get_serializer_class(self):
        if self.action == 'create' and self.request.user.role == 'ADMIN':
            return AdminUserCreateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        if request.user.role != 'ADMIN':
            return Response({"detail": "Only admins can create users."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        generated_username = getattr(user, '_generated_username', user.username)
        generated_password = getattr(user, '_generated_password', None)

        # ── AUTO SEND WELCOME EMAIL ─────────────────────────────────────────
        try:
            from django.core.mail import send_mail
            from django.conf import settings

            login_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/login"
            role_label = user.get_role_display()

            subject = f"Welcome to Nexus LMS — Your {role_label} Account is Ready"
            message = f"""
Hello {user.full_name or generated_username},

Your {role_label} account has been created on Nexus LMS.

━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━
  Login URL   : {login_url}
  {role_label} ID : {generated_username}
  Password    : {generated_password}
━━━━━━━━━━━━━━━━━━━━━━━━

Please log in and change your password immediately.

— Nexus LMS Admin Team
            """.strip()

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,  # Don't crash if email fails
            )
            email_sent = True
        except Exception:
            email_sent = False

        return Response({
            "message": f"{user.role} created successfully.",
            "email_sent": email_sent,
            "user": {
                "id": user.id,
                "username": generated_username,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "password": generated_password
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get('old_password')):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get('new_password'))
            user.save()
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        if request.user.role != 'ADMIN':
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        import random, string
        new_password = f"Nexus@{''.join(random.choices(string.ascii_letters + string.digits, k=6))}"
        user.set_password(new_password)
        user.plain_password = new_password
        user.save()

        # Send Email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            subject = "Nexus LMS — Your Password Has Been Reset"
            message = f"Hello {user.full_name or user.username},\n\nYour password has been reset by the administrator.\n\nYour New Password: {new_password}\n\nPlease log in and change it immediately."
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
            email_sent = True
        except:
            email_sent = False

        return Response({"message": "Password reset successfully.", "new_password": new_password, "email_sent": email_sent})

    @action(detail=False, methods=['post'], url_path='bulk-upload')
    def bulk_upload(self, request):
        if request.user.role != 'ADMIN':
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        import csv, io
        csv_file = request.FILES.get('file')
        role = request.data.get('role', 'STUDENT')
        
        if not csv_file:
            return Response({"error": "Please upload a CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        created_count = 0
        errors = []

        for row in reader:
            try:
                # Expecting columns: full_name, email
                serializer = AdminUserCreateSerializer(data={
                    'full_name': row.get('full_name'),
                    'email': row.get('email'),
                    'role': role
                })
                if serializer.is_valid():
                    serializer.save()
                    created_count += 1
                else:
                    errors.append(f"Row {row.get('email')}: {serializer.errors}")
            except Exception as e:
                errors.append(f"Row {row.get('email')}: {str(e)}")

        return Response({
            "message": f"Successfully created {created_count} users.",
            "errors": errors
        }, status=status.HTTP_201_CREATED)
