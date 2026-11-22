import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import type { UserRole } from '../../types';
import { DEMO_DEPARTMENTS } from '../../context/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { switchRole } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>(initialTab);

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [deptId, setDeptId] = useState<string>(DEMO_DEPARTMENTS[0].id);

  // Student Specific
  const [year, setYear] = useState('3');
  const [semester, setSemester] = useState('6');
  const [studentId, setStudentId] = useState('');

  // Teacher Specific
  const [designation, setDesignation] = useState('Assistant Professor');

  const [message, setMessage] = useState<string | null>(null);

  const handleDemoFill = (selectedRole: UserRole) => {
    switchRole(selectedRole);
    setMessage(`Switched to active ${selectedRole.toUpperCase()} demo account.`);
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      // In demo mode, sign in switches to student
      switchRole('student');
      setMessage('Successfully logged in! Session restored.');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1200);
    } else if (tab === 'signup') {
      switchRole(role);
      setMessage(`Account registered and onboarding verified for ${fullName}!`);
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1200);
    } else {
      setMessage(`Password reset instructions dispatched to ${email || 'your email'}.`);
      setTimeout(() => {
        setMessage(null);
        setTab('login');
      }, 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        tab === 'login'
          ? 'Sign In to EduFlow AI'
          : tab === 'signup'
          ? 'Academic Registration & Onboarding'
          : 'Reset Your Password'
      }
      description={
        tab === 'login'
          ? 'Enter your institutional credentials or select a one-click sample role below.'
          : tab === 'signup'
          ? 'Complete your profile with department accreditation and academic standing.'
          : 'Enter your registered email to receive authentication reset instructions.'
      }
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Quick Demo Switcher Shortcut Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="font-semibold text-slate-800 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Hackathon One-Click Demo Accounts
            </span>
            <Badge variant="primary" size="sm">
              Instant
            </Badge>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left shadow-2xs"
            >
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Student
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Aarav (CSE Yr 3)</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('teacher')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left shadow-2xs"
            >
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Faculty
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Dr. Sunita Rao</p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left shadow-2xs"
            >
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Admin
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Dean Varma</p>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={clsx(
              'pb-2 px-3 font-semibold text-xs border-b-2 transition-all',
              tab === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={clsx(
              'pb-2 px-3 font-semibold text-xs border-b-2 transition-all',
              tab === 'signup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Register / Onboard
          </button>
          <button
            type="button"
            onClick={() => setTab('forgot')}
            className={clsx(
              'pb-2 px-3 font-semibold text-xs border-b-2 transition-all',
              tab === 'forgot'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Forgot Password
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {tab === 'signup' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Role selection - Admin restricted */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Faculty / Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={e => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    {DEMO_DEPARTMENTS.filter(d => d.code !== 'ADMIN').map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Onboarding Fields */}
              {role === 'student' && (
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-2">
                  <p className="font-semibold text-blue-950 text-[11px]">Student Academic Onboarding</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Year</label>
                      <select
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Semester</label>
                      <select
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>
                            Sem {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Student ID</label>
                      <input
                        type="text"
                        placeholder="CSE-2024-042"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Onboarding Fields */}
              {role === 'teacher' && (
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <p className="font-semibold text-emerald-950 text-[11px]">Faculty Accreditation</p>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              placeholder="aarav.sharma@eduflow.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {tab !== 'forgot' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          )}

          <div className="pt-2">
            <Button variant="primary" size="sm" type="submit" className="w-full">
              {tab === 'login'
                ? 'Sign In to Campus Portal'
                : tab === 'signup'
                ? 'Complete Academic Registration'
                : 'Send Password Reset Link'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
