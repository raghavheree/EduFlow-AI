# EduFlow AI — Supabase Database & Backend Architecture

This directory contains the production-ready PostgreSQL database migrations, Row Level Security (RLS) policies, and integration instructions for EduFlow AI.

## Database Entities Overview

1. **Departments (`departments`)**: Academic departments (e.g. CSE, ECE, MECH, CIVIL, MGMT).
2. **User Profiles (`profiles`)**: Extends Supabase `auth.users` with user roles (`student`, `teacher`, `admin`), department mapping, student enrollment details (year, semester, section), and faculty designations.
3. **Subjects (`subjects`)**: Department courses with credit hours and semester mapping.
4. **Classes (`classes`)**: Academic cohorts (e.g. "CSE 3rd Year - Section A") with academic year, year, semester, section.
5. **Teacher Assignments (`teacher_assignments`)**: Relational junction connecting teachers with the specific classes, subjects, and departments they teach.
6. **Student Enrollments (`student_enrollments`)**: Links students to their active class cohorts.
7. **Attendance Sessions & Records (`attendance_sessions`, `attendance_records`)**: Supports single-click "Present All", granular student attendance editing, and class cancellation with reasons.
8. **Notices (`notices`)**: Departmental or college-wide notices with AI categorization and targeted audience delivery.
9. **Assignments (`assignments`)**: Coursework, deadlines, and submissions.
10. **Study Materials (`study_materials`)**: PDF & note storage for AI summary extraction.
11. **Notifications (`notifications`)**: User alerts for attendance, notices, and deadlines.

---

## Row Level Security (RLS) Policy Architecture

To ensure strict institutional multi-tenant department data isolation:

- **Department Isolation**: Records tagged with `department_id` are isolated using `auth.user_department_id()`.
- **Admin Access**: Users with `role = 'admin'` have system-wide visibility and administrative authority.
- **Teacher Access**: Faculty can manage attendance, assignments, and view student profiles within their assigned department(s).
- **Student Privacy**: Students can only view their own records, their enrolled class, and department notices. Department-specific records are inaccessible to users from outside departments.

---

## Storage Buckets to Configure in Supabase

Create the following storage buckets in your Supabase project under **Storage**:

| Bucket Name | Access Level | Allowed MIME Types | Max Size |
|---|---|---|---|
| `avatars` | Public (Read) | `image/jpeg`, `image/png`, `image/webp` | 5 MB |
| `notices-attachments` | Restricted (Auth users) | `application/pdf`, `image/*` | 20 MB |
| `study-materials` | Restricted (Dept members) | `application/pdf`, `application/vnd.*` | 50 MB |
| `assignment-submissions` | Restricted (Teacher + Student) | `application/pdf`, `application/zip` | 25 MB |

---

## Applying Migrations

### Method 1: Using the Supabase Dashboard
1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy and paste the contents of `supabase/migrations/20261122000001_initial_schema.sql`.
4. Click **Run**.

### Method 2: Using Supabase CLI
```bash
# Link project
supabase link --project-ref <your-project-id>

# Apply migrations
supabase db push
```

---

## Environment Configuration

In your project root, copy `.env.example` to `.env` and fill in:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
EduFlow AI automatically detects whether Supabase credentials are configured, providing a live status indicator and graceful offline/demo data mode when testing locally without active cloud credentials.
