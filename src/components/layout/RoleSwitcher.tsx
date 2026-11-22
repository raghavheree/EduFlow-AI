import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, switchRole } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'student',
      label: 'Student',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      desc: 'B.Tech CSE Year 3',
    },
    {
      role: 'teacher',
      label: 'Faculty',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      desc: 'Assoc. Professor CSE',
    },
    {
      role: 'admin',
      label: 'Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      desc: 'Academic Dean',
    },
  ];

  return (
    <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70 text-xs">
      {roles.map((r) => {
        const isActive = currentRole === r.role;
        return (
          <button
            key={r.role}
            onClick={() => switchRole(r.role)}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all duration-150',
              isActive
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
            title={`Switch to ${r.label} role preview (${r.desc})`}
          >
            <span
              className={clsx(
                isActive
                  ? r.role === 'student'
                    ? 'text-blue-600'
                    : r.role === 'teacher'
                    ? 'text-emerald-600'
                    : 'text-purple-600'
                  : 'text-slate-400'
              )}
            >
              {r.icon}
            </span>
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
};
