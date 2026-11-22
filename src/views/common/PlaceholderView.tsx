import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useUI } from '../../context/UIContext';
import {
  Calendar,
  ClipboardCheck,
  FileText,
  Sparkles,
  BookOpen,
  Bell,
  Mail,
  Users,
  Building2,
  ArrowLeft,
  Layers,
} from 'lucide-react';

interface PlaceholderViewProps {
  viewId: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ viewId }) => {
  const { setActiveView } = useUI();

  const moduleData: Record<
    string,
    {
      title: string;
      moduleNumber: number;
      description: string;
      features: string[];
      dbTable: string;
      icon: React.ReactNode;
    }
  > = {
    classes: {
      title: 'Classes & Course Schedules',
      moduleNumber: 2,
      description: 'Department-isolated class scheduling, timetable slots, and faculty assignments.',
      features: [
        'Weekly timetable with room allocation & time slots',
        'Teacher assignment linking for multiple subjects and sections',
        'Real-time conflict detection and schedule export',
      ],
      dbTable: 'classes, subjects, teacher_assignments',
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
    },
    attendance: {
      title: 'Teacher-Managed Attendance Suite',
      moduleNumber: 2,
      description: 'Attendance management featuring single-click "Present All", granular individual student toggles, and Class-Cancelled logging.',
      features: [
        'One-click "Present All" with instant bulk marking',
        'Granular student status editing (Present, Absent, Late, Excused)',
        'Class-Cancelled functionality with reason recording & student alerts',
        'Automated attendance analytics and 75% cutoff threshold tracking',
      ],
      dbTable: 'attendance_sessions, attendance_records',
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
    },
    assignments: {
      title: 'Assignment Management & Deadlines',
      moduleNumber: 3,
      description: 'Coursework submission workflows with Supabase file storage and automated deadline reminders.',
      features: [
        'Teacher assignment creator with attachments and rubric criteria',
        'Student PDF submission portal with version history',
        'Automated deadline alerts and grading summary',
      ],
      dbTable: 'assignments, assignment_submissions',
      icon: <FileText className="w-6 h-6 text-amber-600" />,
    },
    'study-hub': {
      title: 'AI Study Material Discovery',
      moduleNumber: 4,
      description: 'Intelligent PDF note processing, key concept extraction, and automated chapter summaries.',
      features: [
        'PDF lecture notes and slide uploads via Supabase Storage',
        'AI key topic extraction and conceptual summaries',
        'Semantic search across subject materials by unit and topic',
      ],
      dbTable: 'study_materials',
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
    },
    'syllabus-prep': {
      title: 'AI Syllabus & Exam Preparation Recommendations',
      moduleNumber: 5,
      description: 'Syllabus analysis that computes unit weightage and delivers priority-wise study guidance for exams.',
      features: [
        'Syllabus unit breakdown with credit weighting',
        'Priority-ranked high-yield exam preparation topics (P1, P2, P3)',
        'Personalized revision checklist mapped to university curricula',
      ],
      dbTable: 'subjects, study_materials',
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
    },
    notices: {
      title: 'AI-Powered Campus Notices',
      moduleNumber: 3,
      description: 'Notice upload system with automatic AI identification of target departments and audience.',
      features: [
        'Upload notice text or document attachments',
        'AI identifies target department (CSE, ECE, Mech, or All)',
        'AI detects target audience (Students, Faculty, or All)',
        'Automated concise AI summary generation',
      ],
      dbTable: 'notices',
      icon: <Bell className="w-6 h-6 text-blue-600" />,
    },
    emails: {
      title: 'Teacher Email Composition & Scheduled Delivery',
      moduleNumber: 4,
      description: 'Faculty email composer with scheduled delivery to classes, departments, or custom student cohorts.',
      features: [
        'Rich email composer with class-level recipient presets',
        'Scheduled delivery queue (e.g. send at 8:00 AM tomorrow)',
        'Delivery logs and read receipts',
      ],
      dbTable: 'teacher_assignments, profiles, notifications',
      icon: <Mail className="w-6 h-6 text-indigo-600" />,
    },
    students: {
      title: 'Student Roster & Cohort Directory',
      moduleNumber: 2,
      description: 'Comprehensive directory of students filtered by department, year, semester, and section.',
      features: [
        'Roster breakdown by enrollment numbers and sections',
        'Attendance summary per student with quick contact modal',
        'Academic status and performance tracking',
      ],
      dbTable: 'student_enrollments, profiles',
      icon: <Users className="w-6 h-6 text-slate-700" />,
    },
    departments: {
      title: 'Academic Departments Directory',
      moduleNumber: 2,
      description: 'Multi-department organizational structure and head-of-department assignments.',
      features: [
        'Department directory (CSE, ECE, MECH, CIVIL, MGMT)',
        'Faculty and student headcount telemetry',
        'Curriculum and syllabus mapping',
      ],
      dbTable: 'departments, profiles',
      icon: <Building2 className="w-6 h-6 text-blue-700" />,
    },
  };

  const item = moduleData[viewId] || {
    title: 'Academic Module',
    moduleNumber: 2,
    description: 'This module is scheduled for implementation in upcoming modules as part of the phased roadmap.',
    features: ['Database schema planned and prepared in Supabase migration'],
    dbTable: 'profiles, departments',
    icon: <Layers className="w-6 h-6 text-blue-600" />,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            {item.icon}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="primary" size="sm">
                Module {item.moduleNumber} Roadmap
              </Badge>
              <Badge variant="neutral" size="sm">
                Schema Ready in Supabase
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {item.title}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
              {item.description}
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Upcoming Planned Capabilities:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {item.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                Underlying Tables: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">{item.dbTable}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('dashboard')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
