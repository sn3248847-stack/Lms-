from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Quiz, Assignment, Lecture, Submission, QuizResult, Announcement, Notification, Enrollment

@receiver(post_save, sender=Quiz)
def notify_new_quiz(sender, instance, created, **kwargs):
    if created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        for enrollment in enrollments:
            Notification.objects.create(
                user=enrollment.student,
                title="New Quiz Alert",
                message=f"A new quiz '{instance.title}' has been uploaded in {instance.course.title}. Deadline: {instance.due_date}"
            )

@receiver(post_save, sender=Assignment)
def notify_new_assignment(sender, instance, created, **kwargs):
    if created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        for enrollment in enrollments:
            Notification.objects.create(
                user=enrollment.student,
                title="New Assignment Deadline",
                message=f"A new assignment '{instance.title}' has been posted in {instance.course.title}. Due on: {instance.due_date}"
            )

@receiver(post_save, sender=Lecture)
def notify_new_lecture(sender, instance, created, **kwargs):
    if created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        for enrollment in enrollments:
            Notification.objects.create(
                user=enrollment.student,
                title="New Lecture Uploaded",
                message=f"A new lecture '{instance.title}' is now available in {instance.course.title}."
            )

@receiver(post_save, sender=Announcement)
def notify_new_announcement(sender, instance, created, **kwargs):
    if created:
        if instance.course:
            # Notify only students in this specific course
            enrollments = Enrollment.objects.filter(course=instance.course)
            students = [e.student for e in enrollments]
            message_text = f"Announcement for {instance.course.title}: {instance.title}"
        else:
            # Notify all students
            from django.contrib.auth import get_user_model
            User = get_user_model()
            students = User.objects.filter(role='STUDENT')
            message_text = f"Global Announcement: {instance.title}"

        for student in students:
            Notification.objects.create(
                user=student,
                title="New Announcement",
                message=f"From {instance.author.username}: {message_text}"
            )

@receiver(post_save, sender=QuizResult)
def notify_quiz_result(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.student,
            title="Quiz Result Uploaded",
            message=f"Your result for '{instance.quiz.title}' has been automatically calculated. Score: {instance.score}"
        )

@receiver(post_save, sender=Submission)
def notify_submission_graded(sender, instance, created, **kwargs):
    # For submissions, we want to notify when the grade is updated, not just created.
    if not created and instance.grade is not None:
        Notification.objects.create(
            user=instance.student,
            title="Assignment Graded",
            message=f"Your instructor has uploaded the results for '{instance.assignment.title}'. Grade: {instance.grade}"
        )
