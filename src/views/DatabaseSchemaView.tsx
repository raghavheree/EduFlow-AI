import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Database,
  Shield,
  Key,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
} from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const { isConfigured, supabaseHealth, refreshHealth } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState('profiles');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setIsRefreshing(false);
  };

  const tables = [
    {
      name: 'departments',
      description: 'Academic departments (CSE, ECE, MECH, CIVIL, MGMT) with HOD contacts.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique department ID' },
        { name: 'code', type: 'VARCHAR(20)', key: 'UQ', desc: 'Department code (e.g. CSE)' },
        { name: 'name', type: 'VARCHAR(255)', desc: 'Full department name' },
        { name: 'hod_name', type: 'VARCHAR(255)', desc: 'Head of Department' },
        { name: 'contact_email', type: 'VARCHAR(255)', desc: 'Official department contact' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Creation timestamp' },
      ],
      rls: 'Public read for authenticated users; Admins have full access.',
    },
    {
      name: 'profiles',
      description: 'Extends Supabase auth.users with user role, department link, student year/semester/section, or teacher employee info.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK, FK -> auth.users', desc: 'Direct link to Supabase authenticated user' },
        { name: 'email', type: 'VARCHAR(255)', key: 'UQ', desc: 'User college email' },
        { name: 'full_name', type: 'VARCHAR(255)', desc: 'Full legal name' },
        { name: 'role', type: 'user_role', desc: "'student' | 'teacher' | 'admin'" },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id', desc: 'Mandatory department assignment' },
        { name: 'enrollment_number', type: 'VARCHAR(50)', key: 'UQ (Student)', desc: 'Student college roll/enrollment number' },
        { name: 'year', type: 'INT (1-5)', desc: 'Student academic year' },
        { name: 'semester', type: 'INT (1-10)', desc: 'Student active semester' },
        { name: 'section', type: 'VARCHAR(10)', desc: 'Section cohort (e.g. A, B)' },
        { name: 'employee_id', type: 'VARCHAR(50)', key: 'UQ (Teacher)', desc: 'Faculty employee identification number' },
        { name: 'designation', type: 'VARCHAR(100)', desc: 'Academic title (e.g. Associate Professor)' },
        { name: 'status', type: 'VARCHAR(20)', desc: "'active' | 'suspended' | 'graduated'" },
      ],
      rls: 'Users read own profile; Department members read same-department peers; Admins full access. Department isolation enforced.',
    },
    {
      name: 'subjects',
      description: 'Courses offered by departments with credits and semester mapping.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Subject unique identifier' },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id', desc: 'Offering department' },
        { name: 'code', type: 'VARCHAR(50)', desc: 'Course code (e.g. CS301)' },
        { name: 'name', type: 'VARCHAR(255)', desc: 'Course title' },
        { name: 'credits', type: 'INT', desc: 'Credit units' },
        { name: 'semester', type: 'INT', desc: 'Target semester' },
      ],
      rls: 'Department members can view subjects; Only department teachers/admins can insert or edit.',
    },
    {
      name: 'classes',
      description: 'Academic student cohorts (e.g., "CSE 3rd Year - Section A") for course tracking and attendance.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Class unique ID' },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id', desc: 'Department owning the cohort' },
        { name: 'name', type: 'VARCHAR(100)', desc: 'Cohort display name' },
        { name: 'academic_year', type: 'VARCHAR(20)', desc: 'e.g. 2026-2027' },
        { name: 'year', type: 'INT', desc: 'Academic year 1-5' },
        { name: 'semester', type: 'INT', desc: 'Current semester 1-10' },
        { name: 'section', type: 'VARCHAR(10)', desc: 'Section A, B, etc.' },
      ],
      rls: 'Strict department isolation. Only users belonging to the specific department or Admins can view/manage.',
    },
    {
      name: 'teacher_assignments',
      description: 'Junction linking faculty with departments, specific classes, and subjects they manage.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Assignment ID' },
        { name: 'teacher_id', type: 'UUID', key: 'FK -> profiles.id', desc: 'Assigned faculty member' },
        { name: 'class_id', type: 'UUID', key: 'FK -> classes.id', desc: 'Target cohort' },
        { name: 'subject_id', type: 'UUID', key: 'FK -> subjects.id', desc: 'Target subject' },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id', desc: 'Department boundary' },
        { name: 'academic_term', type: 'VARCHAR(50)', desc: 'e.g. Fall 2026' },
        { name: 'is_primary', type: 'BOOLEAN', desc: 'Primary instructor flag' },
      ],
      rls: 'Teachers view their own assignments; Department peers view assigned instructors; Admins full access.',
    },
    {
      name: 'student_enrollments',
      description: 'Links students to their active class cohorts.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Enrollment ID' },
        { name: 'student_id', type: 'UUID', key: 'FK -> profiles.id', desc: 'Enrolled student' },
        { name: 'class_id', type: 'UUID', key: 'FK -> classes.id', desc: 'Enrolled cohort' },
        { name: 'enrolled_at', type: 'TIMESTAMPTZ', desc: 'Enrollment date' },
      ],
      rls: 'Students view their own enrollment; Faculty view students in their assigned department classes; Admins view all.',
    },
    {
      name: 'attendance_sessions',
      description: 'Represents a lecture session for a class and subject, supporting status (completed or cancelled).',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Session ID' },
        { name: 'class_id', type: 'UUID', key: 'FK -> classes.id', desc: 'Target class cohort' },
        { name: 'subject_id', type: 'UUID', key: 'FK -> subjects.id', desc: 'Subject taught' },
        { name: 'teacher_id', type: 'UUID', key: 'FK -> profiles.id', desc: 'Faculty instructor' },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id', desc: 'Department boundary' },
        { name: 'session_date', type: 'DATE', desc: 'Date of lecture' },
        { name: 'status', type: 'session_status', desc: "'scheduled' | 'completed' | 'cancelled'" },
        { name: 'cancellation_reason', type: 'TEXT', desc: 'Reason if cancelled' },
      ],
      rls: 'Only assigned teachers or department faculty can mark/cancel sessions; Students can view sessions for their cohort.',
    },
    {
      name: 'attendance_records',
      description: 'Individual student attendance status per session (present, absent, late, excused).',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Record ID' },
        { name: 'session_id', type: 'UUID', key: 'FK -> attendance_sessions.id', desc: 'Parent session' },
        { name: 'student_id', type: 'UUID', key: 'FK -> profiles.id', desc: 'Student ID' },
        { name: 'status', type: 'attendance_status', desc: "'present' | 'absent' | 'late' | 'excused'" },
        { name: 'remarks', type: 'VARCHAR(255)', desc: 'Optional note' },
        { name: 'marked_at', type: 'TIMESTAMPTZ', desc: 'Timestamp' },
      ],
      rls: 'Students can only view their own records; Teachers in the department can view/edit; Admins full access.',
    },
    {
      name: 'notices',
      description: 'College-wide or department-specific notices with AI audience recommendation.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Notice ID' },
        { name: 'title', type: 'VARCHAR(255)', desc: 'Notice headline' },
        { name: 'content', type: 'TEXT', desc: 'Full text body' },
        { name: 'department_id', type: 'UUID', key: 'FK -> departments.id (Nullable)', desc: 'NULL = College-wide' },
        { name: 'target_audience', type: 'target_audience', desc: "'all' | 'teachers' | 'students'" },
        { name: 'ai_category', type: 'VARCHAR(100)', desc: 'AI extracted category (e.g. Exam Schedule)' },
        { name: 'ai_summary', type: 'TEXT', desc: 'AI concise summary' },
      ],
      rls: 'Users only view notices for their department or college-wide; Audience filter strictly enforced.',
    },
  ];

  const currentTbl = tables.find((t) => t.name === selectedTable) || tables[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card>
        <CardHeader
          title="Supabase PostgreSQL Architecture & Row Level Security (RLS)"
          subtitle="Enterprise-grade relational database design with department-level tenant isolation"
          icon={<Database className="w-5 h-5 text-blue-600" />}
          action={
            <Button
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Check DB Status
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Connection Status
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                {isConfigured && supabaseHealth?.isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-emerald-700">Live Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-xs text-slate-700">Preview / Demo Mode</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isConfigured
                  ? 'Active credentials loaded from .env'
                  : 'Safe mock data active. Configure .env with live keys when ready.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Tenant Isolation Policy
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-xs text-slate-900">Department RLS Enforced</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Unauthorized cross-department data access blocked at the PostgreSQL kernel level.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                SQL Migration Script
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-xs text-slate-800">20261122000001_initial_schema.sql</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ready for Supabase CLI or Dashboard execution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Table Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Selector (Left column) */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Database Entities ({tables.length})
          </p>
          <div className="space-y-1">
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  selectedTable === t.name
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{t.name}</span>
                </div>
                <Badge variant="neutral" size="sm">
                  {t.columns.length} cols
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Table Detail (Right 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader
              title={<span className="font-mono text-sm font-bold text-slate-900">{currentTbl.name}</span>}
              subtitle={currentTbl.description}
              badge={<Badge variant="primary" size="sm">PostgreSQL Table</Badge>}
            />
            <CardContent noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Column</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Keys / Constraints</th>
                      <th className="py-2.5 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTbl.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{c.name}</td>
                        <td className="py-2.5 px-4 font-mono text-blue-600">{c.type}</td>
                        <td className="py-2.5 px-4">
                          {c.key ? (
                            <Badge variant="warning" size="sm" icon={<Key className="w-3 h-3" />}>
                              {c.key}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{c.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* RLS Policy Card for Selected Table */}
          <Card className="border-purple-200/70 bg-purple-50/20">
            <CardHeader
              title="Row Level Security (RLS) Policy for this Table"
              icon={<Shield className="w-4 h-4 text-purple-600" />}
            />
            <CardContent>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {currentTbl.rls}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
