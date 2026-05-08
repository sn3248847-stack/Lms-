from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'phone', 'role', 'is_active', 'plain_password')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False) # Allow blank for generation

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            import random
            import string
            # Very strong password: 12 chars, mix of upper, lower, digits, symbols
            alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
            password = ''.join(random.choices(alphabet, k=12))
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role='STUDENT'
        )
        user._generated_password = password
        return user

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(required=False)  # Auto-generated if not provided
    assigned_courses = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'phone', 'role', 'password', 'assigned_courses', 'is_active', 'plain_password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        import random, string
        from datetime import datetime

        password = validated_data.pop('password', None)
        assigned_courses = validated_data.pop('assigned_courses', [])
        role = validated_data.get('role', 'STUDENT')
        full_name = validated_data.get('full_name', '')

        # ── AUTO-GENERATE UNIQUE ID ───────────────────────────────────────────
        # Format: INST-2025-XXXX (Instructor) | STU-2025-XXXX (Student)
        year = datetime.now().year
        prefix = 'INST' if role == 'INSTRUCTOR' else 'STU'
        suffix = ''.join(random.choices(string.digits, k=4))

        # Derive base from full_name initials if provided, else use random
        if full_name:
            parts = full_name.strip().split()
            initials = ''.join(p[0].upper() for p in parts[:2])
            base_username = f"{prefix}-{year}-{initials}{suffix}"
        else:
            base_username = f"{prefix}-{year}-{suffix}"

        # ── PREPARE DATA FOR CREATION ─────────────────────────────────────────
        # Pop everything we pass explicitly to avoid duplicate argument errors
        email = validated_data.pop('email', None)
        role = validated_data.pop('role', 'STUDENT')
        full_name = validated_data.pop('full_name', '')
        username = validated_data.pop('username', None) or base_username
        plain_pw_data = validated_data.pop('plain_password', None) # Remove from kwargs
        
        # Ensure uniqueness for auto-generated username
        while User.objects.filter(username=username).exists():
            suffix = ''.join(random.choices(string.digits, k=4))
            username = f"{prefix}-{year}-{suffix}"

        # ── AUTO-GENERATE SECURE PASSWORD ────────────────────────────────────
        if not password:
            import random, string
            # Extremely strong: 14 chars, complex mix
            alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
            password = ''.join(random.choices(alphabet, k=14))

        # ── CREATE USER ──────────────────────────────────────────────────────
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            full_name=full_name,
            **validated_data  # Pass remaining fields like phone, is_active, etc.
        )
        
        # Store plain password for admin visibility (safely)
        try:
            user.plain_password = password
            user.save()
        except Exception:
            pass # Fail silently if migration not run
        
        user._generated_password = password
        user._generated_username = username

        # ── COURSE ASSIGNMENT ─────────────────────────────────────────────────
        if assigned_courses and role == 'INSTRUCTOR':
            from courses.models import Course
            Course.objects.filter(id__in=assigned_courses).update(instructor=user)
        elif assigned_courses and role == 'STUDENT':
            from courses.models import Enrollment
            for course_id in assigned_courses:
                Enrollment.objects.get_or_create(student=user, course_id=course_id, defaults={'progress': 0})

        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value
