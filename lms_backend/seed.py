import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Lecture, Assignment, Quiz, Question, Choice
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def seed_data():
    print("Seeding database with 15 Students, 15 Instructors, and 15 Courses...")

    # Create 15 Instructors
    instructors = []
    for i in range(1, 16):
        user, created = User.objects.get_or_create(
            username=f'instructor{i}',
            email=f'instructor{i}@lms.com',
            role='INSTRUCTOR'
        )
        if created:
            user.set_password('password123')
            user.save()
        instructors.append(user)

    # Create 15 Students
    students = []
    for i in range(1, 16):
        user, created = User.objects.get_or_create(
            username=f'student{i}',
            email=f'student{i}@lms.com',
            role='STUDENT'
        )
        if created:
            user.set_password('password123')
            user.save()
        students.append(user)

    # Create 15 Courses
    course_topics = ['Python Basics', 'Advanced JavaScript', 'Machine Learning', 'Data Science', 'Web Design',
                     'React Masterclass', 'Django for Beginners', 'Cloud Computing', 'Cybersecurity 101', 'DevOps',
                     'UI/UX Principles', 'Mobile App Dev', 'Blockchain Tech', 'Game Development', 'SQL & Databases']

    for i, topic in enumerate(course_topics):
        course, created = Course.objects.get_or_create(
            title=topic,
            description=f"This is an in-depth course on {topic}.",
            instructor=random.choice(instructors)
        )
        
        # Create 5 Lectures per course
        if created:
            for j in range(1, 6):
                Lecture.objects.get_or_create(
                    course=course,
                    title=f"Lecture {j}: {topic} Fundamentals",
                    description=f"This lecture covers part {j} of {topic}.",
                    video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # External video resource
                )
            
            # Create 3 Assignments per course
            for k in range(1, 4):
                Assignment.objects.get_or_create(
                    course=course,
                    title=f"Assignment {k}: {topic} Practical",
                    description=f"Please complete the practical exercises for part {k}. Upload your code or PDF below.",
                    due_date=timezone.now() + timedelta(days=7 * k)
                )

            # Create 3 Quizzes per course
            for m in range(1, 4):
                quiz, _ = Quiz.objects.get_or_create(
                    course=course,
                    title=f"Quiz {m}: {topic} Assessment",
                    description=f"Test your knowledge on the concepts of {topic} part {m}.",
                    time_limit_minutes=30,
                    due_date=timezone.now() + timedelta(days=5 * m)
                )

                # Add 3 Questions to each Quiz
                for q in range(1, 4):
                    question, _ = Question.objects.get_or_create(
                        quiz=quiz,
                        text=f"Question {q}: Which of the following is correct regarding {topic}?",
                        is_mcq=True
                    )
                    
                    # Add Choices to the Question (1 correct, 3 incorrect)
                    Choice.objects.get_or_create(question=question, text="This is the correct answer.", is_correct=True)
                    Choice.objects.get_or_create(question=question, text="This is an incorrect answer.", is_correct=False)
                    Choice.objects.get_or_create(question=question, text="This is another wrong answer.", is_correct=False)
                    Choice.objects.get_or_create(question=question, text="None of the above.", is_correct=False)
        
    print("Seeding completed successfully! You now meet the requirements for Courses, Lectures, Assignments, and Quizzes.")

if __name__ == '__main__':
    seed_data()
