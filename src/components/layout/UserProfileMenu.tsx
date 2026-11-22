import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Badge } from '../common/Badge';
import { ChevronDown, User, Settings, LogOut, CheckCircle2, Shield } from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { currentProfile, currentRole, currentDepartment, campusName } = useAuth();
  const { setActiveView } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeVariant = () => {
    switch (currentRole) {
      case 'student':
        return 'primary';
      case 'teacher':
        return 'success';
      case 'admin':
        return 'ai';
      default:
        return 'default';
    }
  };

  const initials = currentProfile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs ring-2 ring-white">
          {initials}
        </div>
        <div className="hidden md:block leading-tight text-left">
          <p className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
            {currentProfile.full_name}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">{currentRole}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200/80 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Summary Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <Badge variant={getRoleBadgeVariant()} size="sm">
                {currentRole.toUpperCase()}
              </Badge>
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{currentProfile.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{currentProfile.email}</p>

            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
              <p className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-700">{currentDepartment.code}</span>
              </p>
              {currentRole === 'student' && (
                <>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Enrollment:</span>
                    <span className="font-mono text-slate-700">{currentProfile.enrollment_number}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Cohort:</span>
                    <span className="font-medium text-slate-700">
                      Year {currentProfile.year} • Sem {currentProfile.semester} ({currentProfile.section})
                    </span>
                  </p>
                </>
              )}
              {currentRole === 'teacher' && (
                <p className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="font-mono text-slate-700">{currentProfile.employee_id}</span>
                </p>
              )}
              {currentRole === 'admin' && (
                <p className="flex justify-between">
                  <span className="text-slate-400">Designation:</span>
                  <span className="font-medium text-slate-700">{currentProfile.designation}</span>
                </p>
              )}
              <p className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Campus:</span>
                <span className="truncate max-w-[150px]">{campusName}</span>
              </p>
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div className="py-1 text-xs">
            <button
              onClick={() => {
                setActiveView('profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Academic Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveView('settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Preferences & Notifications</span>
            </button>
            <button
              onClick={() => {
                setActiveView('database-schema');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Database & RLS Schema</span>
            </button>
          </div>

          <div className="pt-1 border-t border-slate-100 text-xs">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
