# EduFlow AI — Intelligent Academic Management Platform PWA

> *"Your entire academic life, intelligently organised."*

EduFlow AI is a modern, responsive, AI-powered Progressive Web Application (PWA) that connects **Students**, **Faculty/Teachers**, and **College Administrators** in one unified system. It automates routine academic operations, streamlines departmental communication, manages classroom attendance with granular audit trails, coordinates coursework assignments, and provides grounded AI academic assistance.

---

## 🌟 Core Modules & Functional Architecture

### 1. Smart Attendance Management (P0)
- **Faculty / Teacher Experience**:
  - Select class cohort, course subject, and session date.
  - One-click **PRESENT ALL** button: marks all enrolled students present in an instant, while allowing granular individual status adjustments (Present, Absent, Late, Excused) and student-specific remarks before persisting.
  - Official **CLASS CANCELLED / NO CLASS** action: records official cancellation justification (faculty committee duty, campus events, technical power outages). Cancelled sessions are cleanly distinguished and **do not penalize student attendance percentages**.
  - Historical Session Ledger: inspect and re-open previous conducted and cancelled sessions.
- **Student Experience**:
  - Real-time overall attendance percentage calculation based exclusively on valid conducted sessions.
  - Subject-wise attendance breakdown table with conducted vs attended vs cancelled counts.
  - **Attendance Shortage Alert**: automatic warnings when attendance falls below the mandatory 75% cutoff.
  - **Consecutive Recovery Calculator**: calculates the exact number of consecutive attended classes required to reach a target threshold (75%, 80%, 85%) with zero misses.
  - Session Audit Log with verified timestamps and faculty remarks.

### 2. AI Smart Notice Management (P0)
- **Notice Upload & OCR Extraction**: Upload notice circulars via PDF, image, or text input with pre-loaded university sample circulars.
- **AI Classification Engine**:
  - Automatically identifies subject, official purpose, target academic years, and semesters.
  - Classifies notices into categories: **Exam**, **Assignment**, **Event**, **Holiday**, **Registration**, **General**.
  - Extracts key dates, submission deadlines, and student action items into structured cards.
  - Generates a concise executive summary.
- **Department-Level Audience Isolation**:
  - Department filtering is enforced at the data layer: CSE students only receive CSE notices and College-Wide broadcasts; students from other departments cannot view isolated circulars.
  - Confidence scoring and pre-publishing editable verification form so faculty can refine classifications.
- **Student Feed**: Search, category pills, read/unread tracking, pinned notice priority, and original document downloads.

### 3. Smart Assignment Management (P0)
- **Teacher Coursework Dispatch**:
  - Create assignments, attach specification PDFs, define due dates and maximum rubric points.
  - View submission status per enrolled student, inspect uploaded deliverables and repository URLs.
  - Rubric grading modal with numerical score awards and written faculty feedback.
- **Student Assignment Hub**:
  - Filter by All, Pending Action, and Submitted/Graded.
  - Due date countdown timer with overdue indicators.
  - **AI Task Decomposition**: breaks complex assignments into 3-4 pedagogical milestones with estimated effort hours.
  - One-click submission upload with file name, code repository link, and notes to instructor.

### 4. AI Study Material Finder (RAG Document Grounding) (P1)
- **Faculty Resource Repository**: Upload lecture notes, PDF slides, and unit question banks tagged with Department, Subject, Year, Semester, and Unit number.
- **Student Natural Language Chat & Search**:
  - Ask questions such as *"Explain deadlock with an example"*, *"Find notes about normalization"*, *"What are CPU scheduling algorithms?"*, or *"Explain B+ Trees indexing"*.
  - Grounded RAG retrieval matching verified lecture notes chunks.
  - Provides clear pedagogical explanations with **concrete document name and page citations**.
  - Direct button to open and download the verified source PDF.
  - Honest fallback: transparently informs the student if no matching materials exist in their department library.

### 5. AI Smart Exam Evaluation & Priority Matrix (P1)
- Select subject, exam date, available study hours, and upload/edit syllabus units.
- **Priority Matrix Ranking**:
  - **High Priority**: Core, high-recurrence exam concepts covering ~60% of question weightage with justification and recommended study hours.
  - **Medium Priority**: Secondary theoretical units and design problems.
  - **Low Priority**: Supplementary topics for quick final revision.
- **Personalized Multi-Phase Study Plan**: Day-by-day roadmap leading to exam day.
- **Interactive Revision Checklist**: Checkbox tracking with real-time syllabus completion progress.
- **Academic Integrity Disclaimer**: Explicitly explains that AI recommendations are based on syllabus analysis and do not guarantee specific exam questions.

### 6. Teacher Email Automation & Scheduled Broadcast (P1)
- Target recipient cohorts by Class Section, entire Semester, or full Department.
- Flexible delivery options: **Send Immediately** or **Schedule for Later** (date & time picker).
- Scheduled broadcast queue with pending status and cancellation capabilities.
- Dispatch audit ledger logging sent timestamps and recipient counts.
- **Resend Production Email API Integration**: Ready for live SMTP dispatch via `VITE_RESEND_API_KEY`, with an honest, fully transparent development preview gateway when credentials are not yet configured.

### 7. Centralized Notifications & Push Alerts (P1)
- Notifications drawer covering notices, assignments, deadlines, cancellations, and shortage alerts.
- Read/unread state, unread badge counter, and mark all as read.
- Web Push Notifications opt-in with native `Notification.requestPermission()` flow.

### 8. Institutional Dashboards & Administration
- **Student Dashboard**: Welcome banner, live attendance gauge, today's lecture schedule, recent department circulars, and quick access links.
- **Teacher Dashboard**: Daily teaching schedule, quick attendance marking, assignment submissions overview, and circular dispatch.
- **Admin Dashboard**: Executive telemetry, multi-department health table, student/faculty counts, and database RLS policy monitoring.
- **Department & Class Directory**: Multi-department governance, HOD appointments, and weekly timetable schedules.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend / Database**: Supabase, PostgreSQL, Row Level Security (RLS) policies.
- **AI Integration**: Google Gemini API (`gemini-1.5-flash`) with server-side/safe client configuration, paired with a resilient local Edge NLP extraction engine when API keys are unset.
- **Progressive Web Application (PWA)**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`) with cache-first and network-first strategies, installable on mobile/desktop, offline fallback.
- **Deployment**: Vercel deployment ready with `vercel.json` SPA routing rewrites and zero-cache service worker headers.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Installation
```bash
git clone <repository-url>
cd eduflow-ai
npm install
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build & TypeScript Verification
```bash
npm run build
```
This runs `tsc -b` and `vite build`. The production bundle will be output to `dist/`.

---

## 🔑 Environment Configuration

EduFlow AI runs **100% out of the box in Demo Mode** with comprehensive seed data for testing all features without requiring initial external credentials.

To connect live cloud services, copy `.env.example` to `.env`:

```env
# Supabase PostgreSQL & Auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI (Optional)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Resend Email API (Optional)
VITE_RESEND_API_KEY=re_your_resend_api_key

# Institutional Branding
VITE_CAMPUS_NAME="Apex Institute of Technology"
VITE_ACADEMIC_YEAR="2026-2027"
VITE_CURRENT_TERM="Fall 2026"
```

---

## 🗄 Database & Row Level Security (RLS)

The complete PostgreSQL migration script is located at:
`supabase/migrations/20261122000001_initial_schema.sql`

It provisions:
1. `departments` — Multi-department institutional entities.
2. `profiles` — Extended user credentials with roles (`student`, `teacher`, `admin`), student cohorts, and employee IDs.
3. `subjects` — Course units with credits and semester mappings.
4. `classes` — Academic sections and student rosters.
5. `teacher_assignments` — Faculty workload allocations.
6. `student_enrollments` — Section student enrollments.
7. `attendance_sessions` — Classroom session records with completion and cancellation statuses.
8. `attendance_records` — Granular per-student attendance marks with medical/excused remarks.
9. `notices` — Broadcast notices with target audience, department isolation, and AI extraction tags.
10. `assignments` & `assignment_submissions` — Coursework submissions with rubric scoring.
11. `study_materials` — Lecture notes and chunks for semantic search.
12. `notifications` — Centralized user alerts.

All tables have **Row Level Security (RLS) enabled** to ensure students and teachers can only access records within their authorized department.

---

## 📱 Progressive Web App (PWA) Features

- **Installable**: Meets all PWA criteria; installable on Android, iOS, Windows, macOS, and Linux.
- **Service Worker (`sw.js`)**:
  - Statically caches app shell assets (`/`, `/index.html`, `/manifest.json`, icons).
  - Implements **stale-while-revalidate** for static assets.
  - Protects private user academic data: network requests to Supabase APIs and authentication endpoints are never cached in shared device storage.
- **Offline Fallback**: Provides offline continuity if network drops during classroom attendance logging.

---

## 🧑‍💻 Sample Demo Roles for Testing

Switch roles instantly from the top header switcher:
- **Student**: Aarav Sharma (B.Tech CSE Year 3, Sem 6, Sec A) — Test attendance calculator, notice feed, assignment submissions, exam evaluation, and study finder.
- **Faculty / Teacher**: Dr. Sunita Rao (Associate Professor & Class Advisor) — Test **Present All**, **Class Cancelled**, notice uploads with Gemini AI extraction, assignment grading, and scheduled emails.
- **Admin**: Prof. Rajesh Varma (Dean of Academic Affairs) — Test institutional telemetry, multi-department health, and database schema inspections.

---

## 📄 License

MIT License. Built for hackathon demonstration.
