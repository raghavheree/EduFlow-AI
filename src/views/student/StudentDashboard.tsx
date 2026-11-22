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
  BookOpen,
  FileText,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentProfile, currentDepartment } = useAuth();
  const { setActiveView } = useUI();
  const {
    getStudentAttendanceSummary,
    assignments,
    submissions,
    getFilteredNotices,
    examPlans,
  } = useAcademic();

  const summary = getStudentAttendanceSummary(currentProfile.id);
  const userNotices = getFilteredNotices('student', currentDepartment.id).slice(0, 3);
  const pendingAssignmentsCount = assignments.filter(
    a => !submissions.some(s => s.assignment_id === a.id && s.student_id === currentProfile.id)
  ).length;

  const todayClasses = [
    {
      id: '1',
      code: 'CS301',
      name: 'Design & Analysis of Algorithms',
      time: '09:00 AM – 10:30 AM',
      room: 'Room 304 (Lab Wing)',
      teacher: 'Dr. Sunita Rao',
      status: 'present',
    },
    {
      id: '2',
      code: 'CS304',
      name: 'Database Management Systems',
      time: '11:00 AM – 12:30 PM',
      room: 'Lecture Hall 2',
      teacher: 'Prof. Arvind Sharma',
      status: 'upcoming',
    },
    {
      id: '3',
      code: 'CS308',
      name: 'Artificial Intelligence Lab',
      time: '02:00 PM – 04:00 PM',
      room: 'AI Research Lab 1',
      teacher: 'Dr. Sunita Rao',
      status: 'upcoming',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="primary" size="sm" className="bg-blue-500/30 text-blue-100 border-blue-400/30">
              {currentDepartment.name}
            </Badge>
            <span className="text-xs text-blue-200">
              Year {currentProfile.year} • Semester {currentProfile.semester} (Sec {currentProfile.section})
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Welcome back, {currentProfile.full_name}
          </h2>
          <p className="text-blue-100/80 text-xs sm:text-sm max-w-2xl font-light">
            Enrollment ID: <span className="font-mono font-medium text-white">{currentProfile.enrollment_number}</span> • Valid classroom attendance calculated at {summary.overallPercentage}%.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${summary.overallPercentage}%`}
          subtitle={`Min 75% • ${summary.totalAttended}/${summary.totalConducted} classes`}
          icon={<ClipboardCheck className="w-5 h-5" />}
          iconColor={summary.overallPercentage >= 75 ? 'emerald' : 'purple'}
        />
        <StatCard
          title="Enrolled Subjects"
          value={summary.subjects.length.toString()}
          subtitle="24 Credit Units"
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Pending Assignments"
          value={pendingAssignmentsCount.toString()}
          subtitle="Action required"
          icon={<FileText className="w-5 h-5" />}
          iconColor="amber"
        />
        <StatCard
          title="AI Exam Insights"
          value={examPlans.length > 0 ? `${examPlans[0].priority_topics.length} Units` : 'Ready'}
          subtitle="Priority study matrix"
          icon={<Sparkles className="w-5 h-5" />}
          iconColor="purple"
        />
      </div>

      {/* Main Content Split: Timetable & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Today's Class Schedule"
              subtitle="Daily automated timetable with real-time room & faculty info"
              icon={<Calendar className="w-4 h-4" />}
              action={
                <Button variant="outline" size="xs" onClick={() => setActiveView('classes')}>
                  Full Timetable
                </Button>
              }
            />
            <CardContent noPadding>
              <div className="divide-y divide-slate-100">
                {todayClasses.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.room}
                        </span>
                        <span>Faculty: <strong className="font-medium text-slate-700">{item.teacher}</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {item.status === 'present' ? (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Marked Present
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Syllabus Exam Recommendation Preview Card */}
          <Card className="border-purple-200/80 bg-purple-50/30">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <span className="text-purple-700 font-semibold text-sm">AI Syllabus Analysis & Exam Planner</span>
                  <Badge variant="ai" size="sm">Smart Evaluation</Badge>
                </div>
              }
              subtitle="Priority topics derived from syllabus weightage and past question patterns"
              icon={<Sparkles className="w-4 h-4 text-purple-600" />}
              action={
                <Button variant="outline" size="xs" onClick={() => setActiveView('syllabus-prep')}>
                  Open Exam Prep
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3.5 border border-purple-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    P1
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">Dynamic Programming & Graph Algorithms (CS301)</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Predicted weight: 35% of mid-term marks. Focus on Bellman-Ford, Dijkstra, and Matrix Chain Multiplication.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3.5 border border-purple-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    P2
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">ACID Properties & B+ Trees Indexing (CS304)</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Predicted weight: 28% of exam questions. Review concurrent transaction scheduling and query optimization.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Department Notices & Quick Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Department Notices"
              subtitle="Audience-isolated circulars for your department"
              action={
                <Button variant="ghost" size="xs" onClick={() => setActiveView('notices')}>
                  View All
                </Button>
              }
            />
            <CardContent noPadding>
              <div className="divide-y divide-slate-100">
                {userNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setActiveView('notices')}
                    className="p-4 hover:bg-slate-50/50 transition-colors space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="primary" size="sm">{notice.ai_category || 'Notice'}</Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notice.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 leading-snug">{notice.title}</h5>
                    {notice.ai_summary && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{notice.ai_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader title="Student Quick Links" />
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('study-hub')}
                leftIcon={<BookOpen className="w-4 h-4 text-purple-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                AI Study Materials
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('attendance')}
                leftIcon={<ClipboardCheck className="w-4 h-4 text-emerald-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Attendance Calculator
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('assignments')}
                leftIcon={<FileText className="w-4 h-4 text-blue-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Submit Assignments
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => setActiveView('syllabus-prep')}
                leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Smart Exam Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
