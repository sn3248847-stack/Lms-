# LMS Access Credentials

This document lists the pre-configured testing accounts available for the Learning Management System (LMS). 

### **Important Note on Passwords**
I have reset the password for all testing accounts below to **`password123`** so you can log in immediately and test the synchronization across roles.

## **Primary Testing Roles**
| Username | Password | Role | Usage |
| :-- | :-- | :-- | :-- |
| `admin_test_1` | `password123` | **ADMIN** | Full system control, course & user management. |
| `inst_test_1` | `password123` | **INSTRUCTOR** | Curriculum design, student progress, and live Zoom classes. |
| `stud_test_1` | `password123` | **STUDENT** | Enrollment, course participation, and joining live sessions. |

## **Other Registered Users**
*   `Abdullah` (Password: `password123`) - Role: **STUDENT**

---

## **How to Create New Accounts**
1.  **Students:** Go to the [Registration Page](http://localhost:3000/register) and fill in your details. A secure password will be automatically generated for you.
2.  **Instructors:** Log in as an **Admin** and use the **"Add Instructor"** form in the control panel.
3.  **Superuser:** You can create any account (including additional Admins) via the terminal:
    ```bash
    cd lms_backend
    ..\.venv\Scripts\python.exe manage.py createsuperuser
    ```

## **Development URLs**
*   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **Django API Root:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
*   **Django Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
