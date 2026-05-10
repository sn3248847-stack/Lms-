# 🔐 Nexus LMS Authentic Logins

This document contains the official and pre-configured authentic logins for the Nexus LMS production environment.

## **🚀 Administrative Accounts**
| Username | Password | Role | Access Level |
| :-- | :-- | :-- | :-- |
| `admin_test_1` | `password123` | **ADMIN** | Full System Control |
| `admin` | `Nexus@2025` | **ADMIN** | Superuser Access |

---

## **👨‍🏫 Instructor Accounts**
| Username | Password | Full Name | Status |
| :-- | :-- | :-- | :-- |
| `inst_test_1` | `password123` | Senior Instructor | Active |
| `INST-2025-JS1234` | `Nexus@6jK8L2` | John Smith | Demo Instructor |

---

## **🎓 Student Accounts**
| Username | Password | Full Name | Status |
| :-- | :-- | :-- | :-- |
| `stud_test_1` | `password123` | Alpha Student | Active |
| `Abdullah` | `password123` | Abdullah | Active |
| `STU-2025-AD9012` | `Nexus@v3M9P0` | Alice Doe | Demo Student |

---

## **⚙️ System Configuration**
*   **Frontend URL:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
*   **Django Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## **💡 Administrator Tips**
1.  **Credential Visibility:** In the **Admin Dashboard**, you can now see the **Login ID** and **Password** for every instructor and student in their respective lists.
2.  **Creation Logic:** New students registering via the main page now use the **Strong Password System**.
3.  **Password Reset:** If a user forgets their password, use the **Reset Password** button in the Admin Panel to generate a new strong `Nexus@XXXX` password.

---
*Last Updated: May 8, 2026*
