-- ==============================================================================
-- EduFlow AI — Production PostgreSQL Database Schema & Row Level Security (RLS)
-- Migration: 20261122000001_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.session_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.target_audience AS ENUM ('all', 'teachers', 'students');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CORE TABLES

-- Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hod_name VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT NOT NULL,
  avatar_url TEXT,
  phone_number VARCHAR(50),
  
  -- Student Specific Fields
  enrollment_number VARCHAR(50) UNIQUE,
  year INT CHECK (year BETWEEN 1 AND 5),
  semester INT CHECK (semester BETWEEN 1 AND 10),
  section VARCHAR(10),
  
  -- Teacher Specific Fields
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Subjects / Courses Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INT DEFAULT 3 NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(department_id, code)
);

-- Classes / Sections Table (e.g., "CSE 3rd Year - Section A")
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL, -- e.g. "2026-2027"
  year INT NOT NULL CHECK (year BETWEEN 1 AND 5),
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
  section VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(department_id, academic_year, semester, section)
);

-- Teacher Assignments Table (Associates teachers with departments, subjects, and classes)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  academic_term VARCHAR(50) NOT NULL, -- e.g. "Fall 2026"
  is_primary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(teacher_id, class_id, subject_id, academic_term)
);

-- Student Enrollments Table
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(student_id, class_id)
);

-- Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status public.session_status DEFAULT 'completed' NOT NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Attendance Records Table (Per Student)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.attendance_status DEFAULT 'present' NOT NULL,
  remarks VARCHAR(255),
  marked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(session_id, student_id)
);

-- Department & College Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL, -- NULL means college-wide
  author_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  target_audience public.target_audience DEFAULT 'all' NOT NULL,
  attachment_url TEXT,
  ai_category VARCHAR(100),
  ai_summary TEXT,
  ai_target_suggestion TEXT,
  is_pinned BOOLEAN DEFAULT false NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  max_points INT DEFAULT 100 NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Study Materials Table (For AI discovery and syllabus mapping)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  unit_number INT,
  ai_extracted_topics TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system' NOT NULL, -- 'attendance', 'notice', 'assignment', 'ai_alert'
  is_read BOOLEAN DEFAULT false NOT NULL,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_classes_dept_sem ON public.classes(department_id, semester);
CREATE INDEX IF NOT EXISTS idx_subjects_dept ON public.subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON public.teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_class ON public.student_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_date ON public.attendance_sessions(class_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_notices_dept_audience ON public.notices(department_id, target_audience);

-- 5. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS

-- Function to get the authenticated user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to get the authenticated user's department ID
CREATE OR REPLACE FUNCTION public.current_user_department_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7. ROW LEVEL SECURITY POLICIES

-- DEPARTMENTS POLICIES:
-- Admins can view and manage all departments.
-- Students and Teachers can view all departments (for directory/lookup) or their own.
CREATE POLICY "Admins full access on departments"
  ON public.departments FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Authenticated users can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

-- PROFILES POLICIES:
-- Department isolation: Students can only view profiles in their own department.
-- Teachers can view profiles in their own department.
-- Admins can view and manage all profiles.
CREATE POLICY "Admins have full access on profiles"
  ON public.profiles FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile contact details"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view peers in the same department"
  ON public.profiles FOR SELECT
  USING (
    department_id = public.current_user_department_id()
  );

-- SUBJECTS POLICIES:
-- Department-specific records must not be accessible to unauthorized departments.
CREATE POLICY "Admin full access on subjects"
  ON public.subjects FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Users view subjects in their department"
  ON public.subjects FOR SELECT
  USING (
    department_id = public.current_user_department_id()
  );

CREATE POLICY "Teachers can insert/update subjects in their department"
  ON public.subjects FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'teacher' AND
    department_id = public.current_user_department_id()
  );

-- CLASSES POLICIES:
CREATE POLICY "Admin full access on classes"
  ON public.classes FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Department members view classes"
  ON public.classes FOR SELECT
  USING (
    department_id = public.current_user_department_id()
  );

-- TEACHER ASSIGNMENTS POLICIES:
CREATE POLICY "Admin full access on teacher_assignments"
  ON public.teacher_assignments FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Department members view teacher assignments"
  ON public.teacher_assignments FOR SELECT
  USING (
    department_id = public.current_user_department_id()
  );

-- STUDENT ENROLLMENTS POLICIES:
CREATE POLICY "Admin full access on student_enrollments"
  ON public.student_enrollments FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Students view their own enrollments"
  ON public.student_enrollments FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = student_enrollments.class_id
      AND c.department_id = public.current_user_department_id()
      AND public.current_user_role() IN ('teacher', 'admin')
    )
  );

-- ATTENDANCE SESSIONS & RECORDS POLICIES:
CREATE POLICY "Admin full access on attendance sessions"
  ON public.attendance_sessions FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Teachers manage attendance sessions in their department"
  ON public.attendance_sessions FOR ALL
  USING (
    public.current_user_role() = 'teacher' AND
    department_id = public.current_user_department_id()
  );

CREATE POLICY "Students view attendance sessions for their department"
  ON public.attendance_sessions FOR SELECT
  USING (
    department_id = public.current_user_department_id()
  );

CREATE POLICY "Attendance records visibility"
  ON public.attendance_records FOR SELECT
  USING (
    student_id = auth.uid() OR
    public.current_user_role() = 'admin' OR
    (
      public.current_user_role() = 'teacher' AND
      EXISTS (
        SELECT 1 FROM public.attendance_sessions s
        WHERE s.id = attendance_records.session_id
        AND s.department_id = public.current_user_department_id()
      )
    )
  );

CREATE POLICY "Teachers can insert/update attendance records"
  ON public.attendance_records FOR ALL
  USING (
    public.current_user_role() = 'teacher' AND
    EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = attendance_records.session_id
      AND s.department_id = public.current_user_department_id()
    )
  );

-- NOTICES POLICIES:
CREATE POLICY "Admin manage all notices"
  ON public.notices FOR ALL
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Teachers can create and manage notices for their department"
  ON public.notices FOR ALL
  USING (
    public.current_user_role() = 'teacher' AND
    (department_id = public.current_user_department_id() OR author_id = auth.uid())
  );

CREATE POLICY "Users read department and campus notices"
  ON public.notices FOR SELECT
  USING (
    is_published = true AND (
      department_id IS NULL OR -- College-wide
      department_id = public.current_user_department_id() -- User's own department
    ) AND (
      target_audience = 'all' OR
      (target_audience = 'students' AND public.current_user_role() = 'student') OR
      (target_audience = 'teachers' AND public.current_user_role() = 'teacher') OR
      public.current_user_role() = 'admin'
    )
  );

-- NOTIFICATIONS POLICIES:
CREATE POLICY "Users read and manage own notifications"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- 8. INITIAL SEED DATA FOR TESTING / BOOTSTRAP
INSERT INTO public.departments (id, code, name, description, hod_name, contact_email)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering', 'Department of Computer Science & Engineering', 'Dr. Arvind Sharma', 'cse-hod@eduflow.edu'),
  ('a1000000-0000-0000-0000-000000000002', 'ECE', 'Electronics & Communication', 'Department of Electronics & Communication', 'Dr. Meenakshi Sundaram', 'ece-hod@eduflow.edu'),
  ('a1000000-0000-0000-0000-000000000003', 'MECH', 'Mechanical Engineering', 'Department of Mechanical Engineering', 'Dr. R. K. Verma', 'mech-hod@eduflow.edu'),
  ('a1000000-0000-0000-0000-000000000004', 'CIVIL', 'Civil Engineering', 'Department of Civil Engineering', 'Dr. S. K. Gupta', 'civil-hod@eduflow.edu'),
  ('a1000000-0000-0000-0000-000000000005', 'MGMT', 'Management Studies', 'Department of Business & Management Studies', 'Dr. Priya Nair', 'mgmt-hod@eduflow.edu')
ON CONFLICT (code) DO NOTHING;
