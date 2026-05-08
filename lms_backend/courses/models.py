from django.db import models
from django.conf import settings

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught',
        limit_choices_to={'role': 'INSTRUCTOR'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'STUDENT'}
    )
    progress = models.IntegerField(default=0) # 0 to 100 percentage
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.student.username} in {self.course.title}"

class Announcement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='announcements', blank=True, null=True, help_text="Leave blank to send to all students")
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class LiveClass(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='live_classes')
    title = models.CharField(max_length=255)
    meeting_link = models.URLField()
    start_time = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Live: {self.title} ({self.course.title})"

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lecture(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lectures', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True, help_text="Embed link for YouTube/Vimeo/etc.")
    file_attachment = models.FileField(upload_to='lectures/files/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Lecture: {self.title} ({self.course.title})"

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    file_attachment = models.FileField(upload_to='assignments/files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment: {self.title} ({self.course.title})"

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    time_limit_minutes = models.IntegerField(default=30)
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz: {self.title} ({self.course.title})"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    is_mcq = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Question for {self.quiz.title}: {self.text[:30]}"

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Choice: {self.text} ({'Correct' if self.is_correct else 'Incorrect'})"
class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
        limit_choices_to={'role': 'STUDENT'}
    )
    file_attachment = models.FileField(upload_to='submissions/files/', blank=True, null=True)
    text_content = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    feedback = models.TextField(blank=True)
    plagiarism_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Percentage of copied content")
    plagiarism_report = models.TextField(blank=True, help_text="Detailed report of AI/Google sources detected")

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"Submission by {self.student.username} for {self.assignment.title}"

class QuizResult(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_results',
        limit_choices_to={'role': 'STUDENT'}
    )
    score = models.DecimalField(max_digits=5, decimal_places=2)
    file_attachment = models.FileField(upload_to='quiz_submissions/files/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    plagiarism_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Percentage of copied content")
    plagiarism_report = models.TextField(blank=True, help_text="Detailed report of AI/Google sources detected")

    class Meta:
        unique_together = ('quiz', 'student')

    def __str__(self):
        return f"Result: {self.student.username} in {self.quiz.title}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
