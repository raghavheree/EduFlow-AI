import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { RoleSwitcher } from './RoleSwitcher';
import { UserProfileMenu } from './UserProfileMenu';
import { NotificationCenter } from './NotificationCenter';
import {
  Menu,
  Search,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

export const Header: React.FC = () => {
  const { toggleSidebar, activeView, setActiveView } = useUI();
  const { currentDepartment, academicYear, currentTerm, isConfigured, supabaseHealth } = useAuth();

  const getPageTitle = (view: string) => {
    switch (view) {
      case 'dashboard':
        return 'Academic Dashboard';
      case 'classes':
        return 'Classes & Timetable';
      case 'attendance':
        return 'Attendance Management';
      case 'assignments':
        return 'Assignments & Deadlines';
      case 'study-hub':
        return 'AI Study Hub & Notes';
      case 'syllabus-prep':
        return 'AI Syllabus & Exam Insights';
      case 'notices':
        return 'Campus & Department Notices';
      case 'emails':
        return 'Faculty Circulars & Scheduled Emails';
      case 'students':
        return 'Student Directory & Roster';
      case 'departments':
        return 'Department Directory';
      case 'database-schema':
        return 'Database Architecture & RLS';
      case 'profile':
        return 'My Academic Profile';
      case 'settings':
        return 'Settings & System Preferences';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              {getPageTitle(activeView)}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
              {currentDepartment.code}
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-500">
            {academicYear} • {currentTerm}
          </p>
        </div>
      </div>

      {/* Middle: Search & Quick Bar */}
      <div className="hidden xl:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search classes, subjects, faculty, or notices..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setActiveView('notices');
              }
            }}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono shadow-2xs">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls: Role Switcher, DB Status, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Supabase Status Pill */}
        <button
          onClick={() => setActiveView('database-schema')}
          className={clsx(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
            isConfigured && supabaseHealth?.isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          )}
          title={
            isConfigured
              ? 'Supabase Cloud Connected'
              : 'Supabase in Demo Mode (Configure .env to connect to live DB)'
          }
        >
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">
            {isConfigured && supabaseHealth?.isConnected ? 'Supabase Live' : 'DB & RLS'}
          </span>
          {isConfigured && supabaseHealth?.isConnected ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-500" />
          )}
        </button>

        {/* Centralized Notification Center */}
        <NotificationCenter />

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200/80 mx-0.5" />

        {/* User Profile Menu */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
