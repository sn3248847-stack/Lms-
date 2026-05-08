from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum
from .models import Course, Enrollment, Announcement, LiveClass, Section, Lecture, Assignment, Quiz, Submission, QuizResult, Notification
from .serializers import CourseSerializer, EnrollmentSerializer, AnnouncementSerializer, LiveClassSerializer, SectionSerializer, LectureSerializer, AssignmentSerializer, QuizSerializer, SubmissionSerializer, QuizResultSerializer, NotificationSerializer
from .utils import generate_plagiarism_report

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.all()

class LiveClassViewSet(viewsets.ModelViewSet):
    queryset = LiveClass.objects.all()
    serializer_class = LiveClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return LiveClass.objects.all()
        elif user.role == 'INSTRUCTOR':
            return LiveClass.objects.filter(course__instructor=user)
        elif user.role == 'STUDENT':
            enrolled_courses = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
            return LiveClass.objects.filter(course_id__in=enrolled_courses, is_active=True)
        return LiveClass.objects.none()

    def perform_create(self, serializer):
        live_class = serializer.save()
        # Notify all enrolled students
        from .models import Enrollment, Notification
        enrollments = Enrollment.objects.filter(course=live_class.course)
        for e in enrollments:
            Notification.objects.create(
                user=e.student,
                title="🔴 Live Class Started!",
                message=f"Professor started a live session for '{live_class.course.title}'. Join now: {live_class.meeting_link}",
                link=live_class.meeting_link
            )

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Enrollment.objects.all()
        elif user.role == 'INSTRUCTOR':
            return Enrollment.objects.filter(course__instructor=user)
        elif user.role == 'STUDENT':
            return Enrollment.objects.filter(student=user)
        return Enrollment.objects.none()

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.student != request.user:
            return Response({'detail': 'Forbidden.'}, status=403)
        progress = request.data.get('progress', None)
        if progress is not None and 0 <= int(progress) <= 100:
            enrollment.progress = int(progress)
            enrollment.save()
            return Response({'progress': enrollment.progress})
        return Response({'detail': 'Invalid progress value (0-100).'}, status=400)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            return Section.objects.filter(course__instructor=user)
        return Section.objects.all()

class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            return Lecture.objects.filter(course__instructor=user)
        return Lecture.objects.all()

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            return Assignment.objects.filter(course__instructor=user)
        return Assignment.objects.all()

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            return Quiz.objects.filter(course__instructor=user)
        return Quiz.objects.all()

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            # Use assignment__isnull=False to prevent issues if submissions somehow exist without assignments
            return Submission.objects.filter(
                assignment__isnull=False,
                assignment__course__instructor=user
            ).select_related('assignment', 'student', 'assignment__course')
        elif user.role == 'STUDENT':
            return Submission.objects.filter(student=user).select_related('assignment', 'student')
        return Submission.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class QuizResultViewSet(viewsets.ModelViewSet):
    queryset = QuizResult.objects.all()
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            return QuizResult.objects.filter(
                quiz__isnull=False,
                quiz__course__instructor=user
            ).select_related('quiz', 'student', 'quiz__course')
        elif user.role == 'STUDENT':
            return QuizResult.objects.filter(student=user).select_related('quiz', 'student')
        return QuizResult.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def leaderboard(self, request):
        results = (
            QuizResult.objects
            .values('student__id', 'student__username')
            .annotate(avg_score=Avg('score'), total_quizzes=Sum('score'))
            .order_by('-avg_score')[:20]
        )
        return Response(list(results))

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
