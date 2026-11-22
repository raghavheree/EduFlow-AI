import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Building2,
  IdCard,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentProfile, currentDepartment, currentRole, campusName } = useAuth();

  const initials = currentProfile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-blue-50">
            {initials}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentProfile.full_name}</h2>
              <Badge
                variant={
                  currentRole === 'student' ? 'primary' : currentRole === 'teacher' ? 'success' : 'ai'
                }
              >
                {currentRole.toUpperCase()}
              </Badge>
              <Badge variant="neutral">Active Status</Badge>
            </div>

            <p className="text-xs text-slate-500">{currentDepartment.name}</p>
            <p className="text-xs text-slate-400">{campusName}</p>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Academic Membership" icon={<Building2 className="w-4 h-4 text-blue-600" />} />
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-900">{currentDepartment.name} ({currentDepartment.code})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Department HOD</span>
              <span className="font-medium text-slate-800">{currentDepartment.hod_name || 'Prof. Arvind Sharma'}</span>
            </div>

            {currentRole === 'student' && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Enrollment / Roll No.</span>
                  <span className="font-mono font-semibold text-blue-700">{currentProfile.enrollment_number}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Academic Year</span>
                  <span className="font-medium text-slate-800">Year {currentProfile.year} of 4</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Current Semester</span>
                  <span className="font-medium text-slate-800">Semester {currentProfile.semester} (Section {currentProfile.section})</span>
                </div>
              </>
            )}

            {currentRole === 'teacher' && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-mono font-semibold text-blue-700">{currentProfile.employee_id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Designation</span>
                  <span className="font-medium text-slate-800">{currentProfile.designation}</span>
                </div>
              </>
            )}

            {currentRole === 'admin' && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Administrative Role</span>
                <span className="font-medium text-slate-800">{currentProfile.designation}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Contact & Credentials" icon={<IdCard className="w-4 h-4 text-emerald-600" />} />
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Institutional Email</span>
              <span className="font-mono text-slate-800">{currentProfile.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Phone Contact</span>
              <span className="font-medium text-slate-800">{currentProfile.phone_number || '+91 98765 43210'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Auth Identity Provider</span>
              <span className="font-medium text-emerald-600">Supabase Auth (PostgreSQL JWT)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Multi-factor Auth (MFA)</span>
              <span className="font-medium text-slate-600">Configurable in Supabase</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
