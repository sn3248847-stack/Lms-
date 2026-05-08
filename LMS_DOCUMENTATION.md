# 🎓 Nexus LMS — Full-Stack Documentation

Nexus LMS is a professional-grade, role-based Learning Management System designed for scalability, security, and seamless user interaction. This document provides a complete overview of the system architecture and file structure.

---

## 🚀 1. Technology Stack

### **Frontend (Modern Web UI)**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Utility-first styling)
- **Animations:** Framer Motion (Smooth state transitions & modals)
- **Icons:** Lucide React (Premium iconography)
- **Auth Management:** `js-cookie` (Secure token handling)
- **API Client:** Axios (Interconnected backend communication)

### **Backend (Robust API Engine)**
- **Framework:** Django 5.0 + Django REST Framework (DRF)
- **Authentication:** SimpleJWT (Stateless JSON Web Tokens)
- **Database:** SQLite (Default) / PostgreSQL Ready
- **Email:** Django SMTP (TLS Secured)
- **Security:** PBKDF2 with SHA256 Password Hashing

---

## 📂 2. Backend File Structure & Services (`lms_backend/`)

### 👤 **Users App (`users/`)**
- **`models.py`**: Extends Django's `AbstractUser` to include custom roles (`ADMIN`, `INSTRUCTOR`, `STUDENT`), full names, and phone numbers.
- **`serializers.py`**: 
    - `AdminUserCreateSerializer`: The "Brain" of the system. It auto-generates unique Student/Instructor IDs and secure passwords.
    - `UserSerializer`: Handles data packaging for profile views.
- **`views.py`**: 
    - `UserViewSet`: Manages CRUD operations, Bulk CSV Uploads, and Password Resets.
    - `RegisterView`: Public endpoint for student self-registration.
- **`urls.py`**: Routes for login, registration, and user management.

### 📚 **Courses App (`courses/`)**
- **`models.py`**: Defines the entire academic hierarchy:
    - `Course`: The core entity linked to an Instructor.
    - `Enrollment`: Links Students to Courses with progress tracking.
    - `Lecture`: Stores video links and descriptions.
    - `Assignment` & `Submission`: Handles file-based tasks and grading.
    - `Quiz`, `Question`, `Choice`, `QuizResult`: Full MCQ engine with auto-grading logic.
- **`serializers.py`**: Enriches data with "Linking Glue" (e.g., adding `instructor_name` to a Course object for the UI).
- **`views.py`**: Contains the logic for enrolling students, submitting assignments, and processing quiz scores.

### ⚙️ **Core Configuration (`lms_backend/`)**
- **`settings.py`**: Central hub for Security Keys, JWT lifetime, CORS headers, and Secure SMTP Email settings.

---

## 🎨 3. Frontend File Structure & Services (`lms_frontend/`)

### 🧭 **Routes (`src/app/`)**
- **`/login/page.tsx`**: The entry point. Features "Demo Quick-Fill" buttons and secure credential handling.
- **`/admin-dashboard/page.tsx`**: 
    - **Service:** High-level management.
    - **Features:** User tables, Bulk CSV Upload, Password Reset, and Deep-Linking modals.
- **`/instructor-dashboard/page.tsx`**: 
    - **Service:** Academic management.
    - **Features:** Course details, Student progress tracking, Grading engine, and Lecture uploads.
- **`/student-dashboard/page.tsx`**: 
    - **Service:** The learning experience.
    - **Features:** Enrolled course portal, Video lectures, MCQ Quiz attempt interface, and Leaderboards.

### 🛠️ **Utilities (`src/lib/`)**
- **`api.ts`**: The centralized Axios instance. It automatically attaches the JWT token to every request and handles 401 (Unauthorized) redirects to login.

---

## 🔒 4. Security & Business Logic

1.  **Interconnected Linking:** Every entity (Instructor, Student, Course) is linked via ForeignKey relationships. Clicking a name in the UI triggers a lookup across these relations to open the correct profile.
2.  **Auto-Grading:** When a student submits a quiz, the backend compares `choice_id` against `is_correct` in real-time, calculating the score and saving a `QuizResult`.
3.  **CSV Bulk Processing:** The system reads uploaded CSV files, iterates through rows, and triggers the `AdminUserCreateSerializer` for each row, ensuring consistent ID/Password generation for large groups.
4.  **Role-Based Access Control (RBAC):** Every API view checks `request.user.role`. An instructor cannot access Admin tools, and a student cannot grade assignments.

---

## 🛠️ 5. Maintenance & Setup

- **Migrations:** `python manage.py makemigrations` and `python manage.py migrate`
- **Superuser:** `python manage.py createsuperuser` (Access Admin at `/admin`)
- **Frontend Dev:** `npm run dev`
- **Backend Dev:** `python manage.py runserver`

---
*Documentation Generated for Nexus LMS Project v1.0*
