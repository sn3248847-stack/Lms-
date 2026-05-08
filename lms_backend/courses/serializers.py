from rest_framework import serializers
from .models import Course, Enrollment, Announcement, LiveClass, Section, Lecture, Assignment, Quiz, Question, Choice, Submission, QuizResult, Notification

class LiveClassSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = LiveClass
        fields = ['id', 'course', 'course_name', 'title', 'meeting_link', 'start_time', 'is_active', 'created_at']
        read_only_fields = ['created_at']

class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecture
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    lectures = LectureSerializer(many=True, read_only=True)
    class Meta:
        model = Section
        fields = ['id', 'course', 'title', 'order', 'lectures']

class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.CharField(source='instructor.username', read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'instructor_username', 'course_thumbnail', 'category', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', default='', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_name', 'student', 'student_name', 'progress', 'enrolled_at']
        read_only_fields = ['enrolled_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'course', 'course_name', 'title', 'content', 'author', 'author_name', 'created_at']
        read_only_fields = ['created_at', 'author']

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'is_mcq', 'choices', 'created_at']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'title', 'description', 'time_limit_minutes', 'due_date', 'questions', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', default='Student', read_only=True)
    student_username = serializers.CharField(source='student.username', default='', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', default='Assignment', read_only=True)
    course_id = serializers.IntegerField(source='assignment.course.id', default=None, read_only=True)
    class Meta:
        model = Submission
        fields = '__all__'

class QuizResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', default='Student', read_only=True)
    student_username = serializers.CharField(source='student.username', default='', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', default='Quiz', read_only=True)
    course_id = serializers.IntegerField(source='quiz.course.id', default=None, read_only=True)
    class Meta:
        model = QuizResult
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
