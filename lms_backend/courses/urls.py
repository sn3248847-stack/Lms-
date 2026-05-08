from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, EnrollmentViewSet, AnnouncementViewSet, LiveClassViewSet,
    SectionViewSet, LectureViewSet, AssignmentViewSet, QuizViewSet, SubmissionViewSet, QuizResultViewSet, NotificationViewSet
)
router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'liveclasses', LiveClassViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'lectures', LectureViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'quiz-results', QuizResultViewSet)
router.register(r'notifications', NotificationViewSet)
urlpatterns = [
    path('', include(router.urls)),
]
