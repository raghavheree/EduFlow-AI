import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useUI } from '../../context/UIContext';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ClipboardCheck,
  CheckCheck,
  Users,
  Calendar,
  Clock,
  MapPin,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  FileText,
  Bell,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentProfile, currentDepartment } = useAuth();
  const { setActiveView } = useUI();
  const {
    sessions,
    assignments,
    scheduledEmails,
  } = useAcademic();

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingEmailsCount = scheduledEmails.filter(e => e.status === 'pending').length;

  const teacherSchedule = [
    {
      id: 'ts-1',
      className: 'CSE 3rd Year - Section A',
      subjectCode: 'CS301',
      subjectName: 'Design & Analysis of Algorithms',
      time: '09:00 AM – 10:30 AM',
      room: 'Room 304 (Lab Wing)',
      totalStudents: 12,
      status: completedSessions.length > 0 ? 'marked' : 'pending',
      presentCount: 11,
    },
    {
      id: 'ts-2',
      className: 'CSE 2nd Year - Section B',
      subjectCode: 'CS204',
      subjectName: 'Data Structures & OOP in Java',
      time: '11:15 AM – 12:45 PM',
      room: 'Room 201',
      totalStudents: 10,
      status: 'pending',
    },
    {
      id: 'ts-3',
      className: 'CSE 3rd Year - Section A',
      subjectCode: 'CS308',
      subjectName: 'Artificial Intelligence Lab',
      time: '02:00 PM – 04:00 PM',
      room: 'AI Research Lab 1',
      totalStudents: 12,
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm" className="bg-blue-500/30 text-blue-100 border-blue-400/30">
                {currentDepartment.name}
              </Badge>
              <span className="text-xs text-blue-200">
                {currentProfile.designation} • ID: <span className="font-mono">{currentProfile.employee_id}</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              Welcome, {currentProfile.full_name}
            </h2>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-2xl font-light">
              You have 3 scheduled lectures today. Use <strong>Present All</strong> to quickly mark cohort attendance or record class cancellations with reason logs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveView('attendance')}
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              Take Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('notices')}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              Upload Notice
            </Button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Lectures"
          value="3 Sessions"
          subtitle="1 Marked • 2 Upcoming"
          icon={<Calendar className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Avg Class Attendance"
          value="91.4%"
          subtitle="Across enrolled cohorts"
          icon={<ClipboardCheck className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Active Assignments"
          value={assignments.length.toString()}
          subtitle="Coursework in progress"
          icon={<FileText className="w-5 h-5" />}
          iconColor="purple"
        />
        <StatCard
          title="Queued Circulars"
          value={pendingEmailsCount.toString()}
          subtitle="Scheduled Email Outreach"
          icon={<Mail className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      {/* Teaching Schedule & Attendance Execution Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Today's Teaching Schedule & Attendance Action"
              subtitle="Quick attendance marking with single-click Present All, individual editing, and class cancellation"
              icon={<ClipboardCheck className="w-4 h-4" />}
              action={
                <Button variant="outline" size="xs" onClick={() => setActiveView('attendance')}>
                  Attendance Suite
                </Button>
              }
            />
            <CardContent noPadding>
              <div className="divide-y divide-slate-100">
                {teacherSchedule.map((session) => (
                  <div key={session.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {session.subjectCode}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{session.subjectName}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{session.className}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {session.room}
                        </span>
                        <span>{session.totalStudents} enrolled</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {session.status === 'marked' ? (
                        <div className="text-right">
                          <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                            Completed ({session.presentCount}/{session.totalStudents})
                          </Badge>
                          <p className="text-[10px] text-slate-400 mt-0.5">Recorded</p>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveView('attendance')}
                          leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}
                        >
                          Mark Attendance
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Assignments Overview */}
          <Card>
            <CardHeader
              title="Recent Course Assignments"
              subtitle="Submission rates and pending grading"
              action={
                <Button variant="ghost" size="xs" onClick={() => setActiveView('assignments')}>
                  Manage All →
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3 text-xs">
                {assignments.map(asg => (
                  <div
                    key={asg.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                          {asg.subject_code}
                        </span>
                        <span className="font-bold text-slate-900">{asg.title}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Target: {asg.class_name} • Due: {new Date(asg.due_date).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setActiveView('assignments')}
                    >
                      Submissions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fast Tools & Modules */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Faculty Actions" />
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('attendance')}
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Attendance Reports & Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('notices')}
                leftIcon={<Bell className="w-4 h-4 text-blue-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Upload & AI Analyze Notice
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('study-hub')}
                leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Upload Lecture Notes for AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('emails')}
                leftIcon={<Mail className="w-4 h-4 text-indigo-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Scheduled Email Delivery
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('students')}
                leftIcon={<Users className="w-4 h-4 text-slate-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Student Cohort Directory
              </Button>
            </CardContent>
          </Card>

          {/* Department Faculty Advisory Card */}
          <Card className="bg-blue-50/40 border-blue-100">
            <CardHeader
              title={<span className="text-blue-900 font-semibold text-sm">Class Advisory Note</span>}
              subtitle="Department of Computer Science & Engineering"
            />
            <CardContent>
              <p className="text-xs text-blue-950/80 leading-relaxed">
                As the designated advisor for CSE 3rd Year Sec A, remind students with attendance below 75% before the final examination roster cutoff on Friday.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
