from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    INSTRUCTOR = 'INSTRUCTOR', 'Instructor'
    STUDENT = 'STUDENT', 'Student'

class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT,
    )
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    plain_password = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
