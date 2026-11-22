import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import type { NavSection } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  FileText,
  Sparkles,
  BookOpen,
  Bell,
  Mail,
  Users,
  Building2,
  Database,
  Settings,
  Layers,
  X,
  GraduationCap,
  DownloadCloud,
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
  const { currentRole, currentDepartment, campusName } = useAuth();
  const { activeView, setActiveView, sidebarOpen, setSidebarOpen } = useUI();

  // Role-aware navigation definitions
  const getNavSections = (): NavSection[] => {
    switch (currentRole) {
      case 'student':
        return [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Student Dashboard', icon: 'LayoutDashboard', roles: ['student'] },
            ],
          },
          {
            title: 'My Academics',
            items: [
              { id: 'classes', label: 'Classes & Timetable', icon: 'Calendar', roles: ['student'] },
              { id: 'attendance', label: 'My Attendance', icon: 'ClipboardCheck', badge: '88.5%', badgeColor: 'emerald', roles: ['student'] },
              { id: 'assignments', label: 'Course Assignments', icon: 'FileText', badge: 2, badgeColor: 'amber', roles: ['student'] },
            ],
          },
          {
            title: 'AI Academic Tools',
            items: [
              { id: 'study-hub', label: 'AI Study Material Hub', icon: 'BookOpen', badge: 'AI', badgeColor: 'purple', roles: ['student'] },
              { id: 'syllabus-prep', label: 'Syllabus & Exam Prep', icon: 'Sparkles', badge: 'New', badgeColor: 'purple', roles: ['student'] },
            ],
          },
          {
            title: 'Communication',
            items: [
              { id: 'notices', label: 'Notice Board', icon: 'Bell', badge: 3, badgeColor: 'blue', roles: ['student'] },
            ],
          },
        ];

      case 'teacher':
        return [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Faculty Dashboard', icon: 'LayoutDashboard', roles: ['teacher'] },
            ],
          },
          {
            title: 'Classroom Operations',
            items: [
              { id: 'attendance', label: 'Attendance Manager', icon: 'ClipboardCheck', badge: 'Action', badgeColor: 'amber', roles: ['teacher'] },
              { id: 'classes', label: 'Assigned Classes & Subjects', icon: 'Layers', roles: ['teacher'] },
              { id: 'assignments', label: 'Assignments & Evaluations', icon: 'FileText', badge: 4, badgeColor: 'blue', roles: ['teacher'] },
              { id: 'students', label: 'Student Roster', icon: 'Users', roles: ['teacher'] },
            ],
          },
          {
            title: 'AI & Instruction',
            items: [
              { id: 'study-hub', label: 'AI Study Notes & PDFs', icon: 'BookOpen', badge: 'AI', badgeColor: 'purple', roles: ['teacher'] },
              { id: 'syllabus-prep', label: 'Syllabus Coverage AI', icon: 'Sparkles', roles: ['teacher'] },
            ],
          },
          {
            title: 'Outreach & Notices',
            items: [
              { id: 'emails', label: 'Circulars & Scheduled Email', icon: 'Mail', roles: ['teacher'] },
              { id: 'notices', label: 'Department Notices', icon: 'Bell', roles: ['teacher'] },
            ],
          },
        ];

      case 'admin':
        return [
          {
            title: 'Institutional Control',
            items: [
              { id: 'dashboard', label: 'Executive Dashboard', icon: 'LayoutDashboard', roles: ['admin'] },
            ],
          },
          {
            title: 'Academic Structure',
            items: [
              { id: 'departments', label: 'Departments & HODs', icon: 'Building2', badge: '5 Depts', badgeColor: 'blue', roles: ['admin'] },
              { id: 'students', label: 'Student Directory', icon: 'Users', roles: ['admin'] },
              { id: 'classes', label: 'Classes & Faculty Load', icon: 'Layers', roles: ['admin'] },
            ],
          },
          {
            title: 'System & Architecture',
            items: [
              { id: 'database-schema', label: 'Database & RLS Schema', icon: 'Database', badge: 'RLS', badgeColor: 'purple', roles: ['admin'] },
              { id: 'notices', label: 'Campus Broadcast Notices', icon: 'Bell', roles: ['admin'] },
              { id: 'settings', label: 'Platform Settings', icon: 'Settings', roles: ['admin'] },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4 shrink-0' };
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard {...props} />;
      case 'Calendar':
        return <Calendar {...props} />;
      case 'ClipboardCheck':
        return <ClipboardCheck {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Bell':
        return <Bell {...props} />;
      case 'Mail':
        return <Mail {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'Building2':
        return <Building2 {...props} />;
      case 'Database':
        return <Database {...props} />;
      case 'Settings':
        return <Settings {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      default:
        return <FileText {...props} />;
    }
  };

  const navSections = getNavSections();

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              EduFlow <span className="text-blue-600 font-extrabold text-xs px-1.5 py-0.5 rounded bg-blue-50">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] leading-none">
              Academic OS • {campusName}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Department & Role Badge Banner */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Department:</span>
          <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/60 truncate max-w-[125px]">
            {currentDepartment.name}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={clsx(
                        'transition-colors',
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    >
                      {renderIcon(item.icon)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        item.badgeColor === 'emerald' && 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
                        item.badgeColor === 'amber' && 'bg-amber-50 text-amber-700 border border-amber-200/80',
                        item.badgeColor === 'purple' && 'bg-purple-50 text-purple-700 border border-purple-200/80',
                        item.badgeColor === 'blue' && 'bg-blue-50 text-blue-700 border border-blue-200/80',
                        !item.badgeColor && 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* PWA & System Information Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="bg-white rounded-lg p-2.5 border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>PWA Ready</span>
          </div>
          <span className="font-semibold text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};
