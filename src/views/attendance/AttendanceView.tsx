import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  ClipboardCheck,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Search,
  Check,
  X,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { DEMO_CLASSES, DEMO_SUBJECTS } from '../../context/mockData';

export const AttendanceView: React.FC = () => {
  const { currentRole, currentProfile, currentDepartment } = useAuth();
  const {
    sessions,
    studentsRoster,
    saveAttendanceSession,
    cancelClassSession,
    getStudentAttendanceSummary,
    calculateConsecutiveClassesNeeded,
  } = useAcademic();

  // Active view mode for teachers / admins
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');

  // Teacher Selection State
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-01');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-01');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM – 10:30 AM');

  // In-session Student Marks State
  const [studentMarks, setStudentMarks] = useState<
    Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }>
  >(() => {
    const initial: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; remarks?: string }> = {};
    studentsRoster.forEach(st => {
      initial[st.id] = { status: st.status };
    });
    return initial;
  });

  // UI state for modals & search
  const [rosterSearch, setRosterSearch] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // Filtered roster for teacher taking attendance
  const filteredRoster = studentsRoster.filter(st =>
    st.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    st.roll.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  // Present All Handler
  const handlePresentAll = () => {
    const updated = { ...studentMarks };
    studentsRoster.forEach(st => {
      updated[st.id] = { ...updated[st.id], status: 'present' };
    });
    setStudentMarks(updated);
    setSuccessFeedback('All enrolled students marked PRESENT! You can adjust individuals before saving.');
    setTimeout(() => setSuccessFeedback(null), 4000);
  };

  // Toggle individual student status
  const toggleStudentStatus = (studentId: string, status: 'present' | 'absent') => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  // Teacher Save Attendance Session
  const handleSaveAttendance = async () => {
    const selectedClass = DEMO_CLASSES.find(c => c.id === selectedClassId);
    const selectedSubject = DEMO_SUBJECTS.find(s => s.id === selectedSubjectId);

    const records = studentsRoster.map(st => ({
      student_id: st.id,
      student_name: st.name,
      enrollment_number: st.roll,
      status: studentMarks[st.id]?.status || 'present',
      remarks: studentMarks[st.id]?.remarks,
    }));

    await saveAttendanceSession(
      {
        class_id: selectedClassId,
        class_name: selectedClass?.name || 'Class Room',
        subject_id: selectedSubjectId,
        subject_name: selectedSubject?.name || 'Subject',
        subject_code: selectedSubject?.code || 'CS300',
        teacher_id: currentProfile.id,
        teacher_name: currentProfile.full_name,
        department_id: currentDepartment.id,
        session_date: sessionDate,
        time_slot: timeSlot,
        status: 'completed',
      },
      records
    );

    const presentCount = Object.values(studentMarks).filter(m => m.status === 'present').length;
    setSuccessFeedback(
      `Attendance saved! Logged ${presentCount} Present and ${studentsRoster.length - presentCount} Absent for ${selectedSubject?.code}.`
    );
    setTimeout(() => setSuccessFeedback(null), 5000);
  };

  // Class Cancelled Action
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter a cancellation reason.');
      return;
    }

    await cancelClassSession(
      selectedClassId,
      selectedSubjectId,
      sessionDate,
      timeSlot,
      cancelReason.trim(),
      currentProfile.id,
      currentProfile.full_name,
      currentDepartment.id
    );

    setCancelModalOpen(false);
    setCancelReason('');
    setSuccessFeedback('Class marked CANCELLED. Excluded from student attendance percentage calculation.');
    setTimeout(() => setSuccessFeedback(null), 5000);
  };

  // Summary counts for current in-progress mark
  const currentPresentCount = Object.values(studentMarks).filter(m => m.status === 'present').length;
  const currentAbsentCount = Object.values(studentMarks).filter(m => m.status === 'absent').length;
  const currentPercentage =
    studentsRoster.length > 0 ? ((currentPresentCount / studentsRoster.length) * 100).toFixed(1) : '0';

  // ==============================================================
  // STUDENT VIEW IMPLEMENTATION
  // ==============================================================
  if (currentRole === 'student') {
    const summary = getStudentAttendanceSummary(currentProfile.id);
    const hasShortage = summary.overallPercentage < 75.0 || summary.subjects.some(s => s.is_shortage);

    return (
      <div className="space-y-6">
        {/* Student Attendance Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm" className="bg-blue-500/30 text-blue-100 border-blue-400/30">
                  {currentDepartment.name}
                </Badge>
                <span className="text-xs text-blue-200">
                  Semester {currentProfile.semester} • Section {currentProfile.section}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Academic Attendance Record</h2>
              <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
                Real-time verified attendance calculated from accredited classroom sessions. Cancelled classes are excluded from negative weighting.
              </p>
            </div>

            {/* Circular Gauge / Percentage Display */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-xl border border-white/15">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">Overall Attendance</p>
                <p className="text-3xl font-extrabold tracking-tight">
                  {summary.overallPercentage}%
                </p>
                <p className="text-[11px] text-blue-200/90 mt-0.5">
                  {summary.totalAttended} / {summary.totalConducted} Conducted Sessions
                </p>
              </div>
              <div
                className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-inner',
                  summary.overallPercentage >= 75
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white animate-pulse'
                )}
              >
                {summary.overallPercentage >= 75 ? '✓' : '!'}
              </div>
            </div>
          </div>
        </div>

        {/* Shortage Warning Banner if applicable */}
        {hasShortage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm text-amber-950">Attendance Shortage Warning Alert</p>
              <p>
                Your attendance in one or more courses is below the <strong>75% institutional threshold</strong>. University regulations require remedial attendance before semester-end examinations.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Conducted Classes"
            value={summary.totalConducted.toString()}
            subtitle="Valid lecture hours held"
            icon={<ClipboardCheck className="w-5 h-5" />}
            iconColor="blue"
          />
          <StatCard
            title="Attended Classes"
            value={summary.totalAttended.toString()}
            subtitle="Marked present by faculty"
            icon={<CheckCheck className="w-5 h-5" />}
            iconColor="emerald"
          />
          <StatCard
            title="Cancelled Sessions"
            value={summary.totalCancelled.toString()}
            subtitle="Exempt from attendance %"
            icon={<AlertTriangle className="w-5 h-5" />}
            iconColor="amber"
          />
          <StatCard
            title="Attendance Status"
            value={summary.overallPercentage >= 75 ? 'Eligible' : 'Shortage'}
            subtitle={summary.overallPercentage >= 75 ? 'Eligible for final exams' : 'Requires remedial classes'}
            icon={<ShieldCheck className="w-5 h-5" />}
            iconColor={summary.overallPercentage >= 75 ? 'emerald' : 'purple'}
          />
        </div>

        {/* Subject-Wise Attendance Breakdown Table */}
        <Card>
          <CardHeader
            title="Subject-Wise Attendance Breakdown"
            subtitle="Course-level tracking with consecutive recovery calculator"
          />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-3 pr-4">Course</th>
                    <th className="pb-3 px-4">Conducted</th>
                    <th className="pb-3 px-4">Attended</th>
                    <th className="pb-3 px-4">Cancelled</th>
                    <th className="pb-3 px-4">Percentage</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4">Target Recovery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.subjects.map(subj => {
                    const neededForTarget = calculateConsecutiveClassesNeeded(
                      subj.conducted,
                      subj.attended,
                      targetPercentage
                    );

                    return (
                      <tr key={subj.subject_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-slate-900">{subj.subject_name}</p>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {subj.subject_code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{subj.conducted}</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-semibold">{subj.attended}</td>
                        <td className="py-3.5 px-4 text-amber-700">
                          {subj.cancelled}{' '}
                          <span className="text-[10px] text-slate-400 font-light">(neutral)</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={clsx(
                                  'h-full rounded-full transition-all duration-300',
                                  subj.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                )}
                                style={{ width: `${Math.min(100, subj.percentage)}%` }}
                              />
                            </div>
                            <span
                              className={clsx(
                                'font-bold font-mono text-xs',
                                subj.percentage >= 75 ? 'text-slate-900' : 'text-rose-600'
                              )}
                            >
                              {subj.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={subj.is_shortage ? 'danger' : 'success'} size="sm">
                            {subj.is_shortage ? 'Below 75%' : 'Good'}
                          </Badge>
                        </td>
                        <td className="py-3.5 pl-4">
                          {neededForTarget === 0 ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5" /> On Track
                            </span>
                          ) : (
                            <span className="text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              Attend next <strong>{neededForTarget}</strong> consecutive {neededForTarget === 1 ? 'class' : 'classes'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Target Slider for Consecutive Calculator */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Attendance Target Recovery Calculator</p>
                  <p className="text-[11px] text-slate-500">
                    Adjust target threshold to simulate required consecutive lecture presence.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  {[75, 80, 85].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setTargetPercentage(pct)}
                      className={clsx(
                        'px-2.5 py-1 text-xs font-semibold rounded transition-all',
                        targetPercentage === pct
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Session Audit Log */}
        <Card>
          <CardHeader
            title="Recent Session Attendance History"
            subtitle="Verified transaction ledger with faculty timestamps and cancellation details"
          />
          <CardContent>
            <div className="space-y-3">
              {sessions.map(ses => {
                const isCancelled = ses.status === 'cancelled';
                return (
                  <div
                    key={ses.id}
                    className={clsx(
                      'p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
                      isCancelled
                        ? 'bg-amber-50/60 border-amber-200/70'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{ses.subject_name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ses.subject_code}
                        </span>
                        {isCancelled ? (
                          <Badge variant="warning" size="sm">
                            Class Cancelled
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Marked Present
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ses.session_date} •{' '}
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {ses.time_slot} • Faculty: {ses.teacher_name}
                      </p>
                      {isCancelled && ses.cancellation_reason && (
                        <p className="text-amber-800 font-medium bg-amber-100/60 p-2 rounded text-[11px] mt-1 border border-amber-200/50">
                          <strong>Cancellation Reason:</strong> {ses.cancellation_reason}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Session Ref: {ses.id.substring(0, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================================
  // TEACHER & ADMIN ATTENDANCE MANAGEMENT VIEW
  // ==============================================================
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm" className="bg-blue-500/30 text-blue-100 border-blue-400/30">
                {currentDepartment.name}
              </Badge>
              <span className="text-xs text-blue-200">Faculty Attendance Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Smart Classroom Attendance Manager</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              One-click batch marking with <strong>Present All</strong>, student-level adjustments, and official <strong>Class Cancelled</strong> logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('take')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === 'take'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              Take Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              Previous Sessions ({sessions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {successFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successFeedback}</span>
          </div>
          <button
            onClick={() => setSuccessFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {activeTab === 'take' ? (
        <div className="space-y-6">
          {/* Controls Bar: Select Class, Subject, Date & Fast Actions */}
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Class Cohort</label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DEMO_CLASSES.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.academic_year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Subject / Course</label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id).map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} — {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Timetable Slot</label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="09:00 AM – 10:30 AM">09:00 AM – 10:30 AM</option>
                    <option value="11:00 AM – 12:30 PM">11:00 AM – 12:30 PM</option>
                    <option value="01:30 PM – 03:00 PM">01:30 PM – 03:00 PM</option>
                    <option value="03:15 PM – 04:45 PM">03:15 PM – 04:45 PM</option>
                  </select>
                </div>
              </div>

              {/* Action Toolbar with PRESENT ALL and CLASS CANCELLED */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Attendance Summary Pill */}
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                    <span className="text-slate-600">Cohort: {studentsRoster.length} students</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold">{currentPresentCount} Present</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-700 font-semibold">{currentAbsentCount} Absent</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-700 font-bold">{currentPercentage}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* PROMINENT PRESENT ALL BUTTON */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePresentAll}
                    leftIcon={<CheckCheck className="w-4 h-4" />}
                    className="shadow-sm hover:shadow"
                  >
                    PRESENT ALL
                  </Button>

                  {/* CLASS CANCELLED BUTTON */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelModalOpen(true)}
                    leftIcon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    className="text-amber-800 hover:bg-amber-50 border-amber-200"
                  >
                    Class Cancelled / No Class
                  </Button>

                  {/* SAVE SESSION BUTTON */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveAttendance}
                    leftIcon={<ClipboardCheck className="w-4 h-4 text-emerald-600" />}
                  >
                    Save Attendance Record
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Roster Marking Table */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center justify-between w-full">
                  <span>Enrolled Student Roster</span>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name or enrollment..."
                      value={rosterSearch}
                      onChange={e => setRosterSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              }
              subtitle="Click Present/Absent to adjust status. Remarks are optional for medical or official leave."
            />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 px-4">Student</th>
                      <th className="pb-3 px-4">Enrollment ID</th>
                      <th className="pb-3 px-4">Attendance Status</th>
                      <th className="pb-3 pl-4">Remarks / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoster.map((st, idx) => {
                      const isPresent = studentMarks[st.id]?.status === 'present';
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pr-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                                {st.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-900">{st.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 font-medium">{st.roll}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleStudentStatus(st.id, 'present')}
                                className={clsx(
                                  'px-3 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1',
                                  isPresent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                )}
                              >
                                <Check className="w-3 h-3" /> Present
                              </button>
                              <button
                                onClick={() => toggleStudentStatus(st.id, 'absent')}
                                className={clsx(
                                  'px-3 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1',
                                  !isPresent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                )}
                              >
                                <X className="w-3 h-3" /> Absent
                              </button>
                            </div>
                          </td>
                          <td className="py-3 pl-4">
                            <input
                              type="text"
                              placeholder="e.g. Medical leave, On duty..."
                              value={studentMarks[st.id]?.remarks || ''}
                              onChange={e => updateRemarks(st.id, e.target.value)}
                              className="w-full max-w-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Previous Attendance Sessions History Tab */
        <Card>
          <CardHeader
            title="Archived Attendance Sessions"
            subtitle="Historical ledger of past conducted lectures, batch attendance tallies, and class cancellations"
          />
          <CardContent>
            <div className="space-y-3">
              {sessions.map(ses => {
                const isCancelled = ses.status === 'cancelled';
                return (
                  <div
                    key={ses.id}
                    className={clsx(
                      'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all',
                      isCancelled ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200 hover:shadow-xs'
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{ses.class_name}</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {ses.subject_code}
                        </span>
                        {isCancelled ? (
                          <Badge variant="warning" size="sm">
                            Cancelled Session
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Completed Session
                          </Badge>
                        )}
                      </div>

                      <p className="text-slate-600">
                        {ses.subject_name} • <span className="font-medium text-slate-800">{ses.session_date}</span> (
                        {ses.time_slot}) • Instructor: {ses.teacher_name}
                      </p>

                      {isCancelled ? (
                        <p className="text-amber-900 font-medium bg-amber-100/70 p-2.5 rounded-lg border border-amber-200">
                          <strong>Reason for Cancellation:</strong> {ses.cancellation_reason}
                        </p>
                      ) : (
                        <div className="flex items-center gap-3 text-slate-600 font-medium">
                          <span className="text-emerald-700">{ses.present_count} Present</span>
                          <span>•</span>
                          <span className="text-rose-700">{ses.absent_count} Absent</span>
                          <span>•</span>
                          <span className="text-slate-900 font-bold">
                            {ses.total_enrolled && ses.total_enrolled > 0
                              ? (((ses.present_count || 0) / ses.total_enrolled) * 100).toFixed(1)
                              : '0'}
                            % Attendance
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedClassId(ses.class_id);
                          setSelectedSubjectId(ses.subject_id);
                          setSessionDate(ses.session_date);
                          setTimeSlot(ses.time_slot);
                          setActiveTab('take');
                        }}
                      >
                        Re-open / Inspect
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Cancelled Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Mark Scheduled Class as Cancelled"
        description="Cancelled sessions do not count as conducted and will NOT penalize student attendance percentages."
      >
        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Academic Compliance Notice
            </p>
            <p>
              Please enter the official institutional justification (e.g. faculty leave, college sports event, or university committee duty). This notice will be archived for audit compliance.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Faculty attending IEEE International Conference on Computing. Make-up lecture will be scheduled on Saturday."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmCancel}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Class Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
