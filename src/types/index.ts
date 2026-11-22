// EduFlow AI - Core TypeScript Definitions

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  hod_name?: string;
  contact_email?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id: string;
  department?: Department;
  avatar_url?: string;
  phone_number?: string;
  // Student attributes
  enrollment_number?: string;
  year?: number;
  semester?: number;
  section?: string;
  // Teacher attributes
  employee_id?: string;
  designation?: string;
  status: 'active' | 'suspended' | 'graduated' | 'on_leave';
  created_at?: string;
}

export interface Subject {
  id: string;
  department_id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  semester: number;
}

export interface ClassRoom {
  id: string;
  department_id: string;
  name: string;
  academic_year: string;
  year: number;
  semester: number;
  section: string;
  student_count?: number;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  department_id: string;
  academic_term: string;
  is_primary: boolean;
  class?: ClassRoom;
  subject?: Subject;
}

// Attendance Types
export type AttendanceStatusType = 'present' | 'absent' | 'late' | 'excused';
export type SessionStatusType = 'scheduled' | 'completed' | 'cancelled';

export interface AttendanceSession {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  department_id: string;
  session_date: string; // YYYY-MM-DD
  time_slot: string;
  status: SessionStatusType;
  cancellation_reason?: string;
  created_at: string;
  present_count?: number;
  absent_count?: number;
  total_enrolled?: number;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  enrollment_number: string;
  status: AttendanceStatusType;
  remarks?: string;
  marked_at: string;
}

export interface SubjectAttendanceSummary {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  conducted: number;
  attended: number;
  cancelled: number;
  percentage: number;
  is_shortage: boolean; // < 75%
}

export interface StudentAttendanceOverview {
  totalConducted: number;
  totalCancelled: number;
  totalAttended: number;
  overallPercentage: number;
  subjects: SubjectAttendanceSummary[];
}

// Notice Types
export interface NoticeDateExtraction {
  label: string;
  date: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  department_id?: string | null; // NULL for college-wide
  department_name?: string;
  author_id: string;
  author_name?: string;
  target_audience: 'all' | 'teachers' | 'students';
  target_year?: number | null;
  target_semester?: number | null;
  attachment_url?: string;
  attachment_name?: string;
  ai_category?: 'Exam' | 'Assignment' | 'Event' | 'Holiday' | 'Registration' | 'General' | string;
  ai_summary?: string;
  ai_extracted_dates?: NoticeDateExtraction[];
  ai_action_items?: string[];
  ai_confidence?: number;
  is_pinned?: boolean;
  is_published: boolean;
  published_at: string;
  read_by?: string[];
}

// Assignment Types
export interface AssignmentTaskBreakdown {
  id: string;
  step: number;
  task: string;
  estimated_time: string;
  completed?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  department_id: string;
  due_date: string; // ISO string
  max_points: number;
  attachment_url?: string;
  attachment_name?: string;
  ai_summary?: string;
  ai_tasks?: AssignmentTaskBreakdown[];
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  enrollment_number: string;
  submitted_at: string;
  file_url?: string;
  file_name?: string;
  repo_url?: string;
  notes?: string;
  marks_awarded?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

// Study Materials & RAG Types
export interface MaterialChunk {
  chunk_id: string;
  page_number: number;
  topic_title: string;
  content: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  department_id: string;
  department_name: string;
  academic_year: string;
  semester: number;
  unit_number: number;
  topic: string;
  uploader_id: string;
  uploader_name: string;
  file_url: string;
  file_type: string;
  file_size: string;
  ai_extracted_topics: string[];
  ai_summary: string;
  chunks: MaterialChunk[];
  created_at: string;
}

// Scheduled Email Types
export interface ScheduledEmail {
  id: string;
  teacher_id: string;
  teacher_name: string;
  recipient_type: 'class' | 'semester' | 'department';
  recipient_target: string;
  recipient_count: number;
  subject: string;
  message: string;
  scheduled_time: string; // ISO string
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string;
  error_message?: string;
}

// Exam Preparation & Syllabus Types
export interface ExamPriorityTopic {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  weightage_pct: number;
  suggested_hours: number;
  justification: string;
  important_subtopics: string[];
  study_order: number;
  completed: boolean;
}

export interface ExamPreparationPlan {
  id: string;
  student_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  exam_date: string;
  study_hours_available: number;
  daily_hours: number;
  generated_at: string;
  priority_topics: ExamPriorityTopic[];
  study_phases: { phase_name: string; duration: string; focus: string }[];
  revision_checklist: { id: string; item: string; checked: boolean }[];
  ai_disclaimer: string;
}

// Scheduled Class Timetable
export interface ScheduledClass {
  id: string;
  subject_name: string;
  subject_code: string;
  room: string;
  time_slot: string;
  teacher_name?: string;
  class_name?: string;
  day_of_week?: string;
  attendance_status?: 'present' | 'absent' | 'upcoming' | 'cancelled';
}

// Notification Types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'notice' | 'assignment' | 'ai_alert' | 'system' | 'email';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_view?: string;
}

// UI Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeColor?: 'blue' | 'purple' | 'amber' | 'emerald';
  roles: UserRole[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
