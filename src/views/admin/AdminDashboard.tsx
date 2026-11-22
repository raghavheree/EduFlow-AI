import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_DEPARTMENTS } from '../../context/mockData';
import { useUI } from '../../context/UIContext';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Building2,
  Users,
  GraduationCap,
  ClipboardCheck,
  ShieldAlert,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentProfile, campusName, isConfigured, supabaseHealth } = useAuth();
  const { setActiveView } = useUI();

  const departmentMetrics = [
    {
      ...DEMO_DEPARTMENTS[0],
      students: 780,
      faculty: 42,
      attendance: '89.2%',
      status: 'optimal',
    },
    {
      ...DEMO_DEPARTMENTS[1],
      students: 620,
      faculty: 36,
      attendance: '86.4%',
      status: 'optimal',
    },
    {
      ...DEMO_DEPARTMENTS[2],
      students: 540,
      faculty: 30,
      attendance: '84.8%',
      status: 'warning',
    },
    {
      ...DEMO_DEPARTMENTS[3],
      students: 420,
      faculty: 24,
      attendance: '91.0%',
      status: 'optimal',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="ai" size="sm" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              Institutional Governance
            </Badge>
            <span className="text-xs text-purple-200">
              {currentProfile.designation} • {campusName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Executive Academic Dashboard
          </h2>
          <p className="text-purple-100/80 text-xs sm:text-sm max-w-2xl font-light">
            Campus-wide academic metrics, multi-department telemetry, and Row Level Security policy oversight.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Campus KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Departments"
          value="5"
          subtitle="All academic faculties"
          icon={<Building2 className="w-5 h-5" />}
          iconColor="purple"
        />
        <StatCard
          title="Total Students"
          value="2,360"
          subtitle="Enrolled across cohorts"
          icon={<GraduationCap className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Teaching Faculty"
          value="132"
          subtitle="Full-time & adjunct"
          icon={<Users className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Campus Avg Attendance"
          value="87.8%"
          subtitle="Threshold: 75% min"
          icon={<ClipboardCheck className="w-5 h-5" />}
          iconColor="amber"
          change={{ value: "+0.8% overall", trend: "up" }}
        />
      </div>

      {/* Department Breakdown Table */}
      <Card>
        <CardHeader
          title="Department Operations & Academic Health"
          subtitle="Cross-departmental performance and attendance compliance"
          icon={<Building2 className="w-4 h-4" />}
          action={
            <Button
              variant="outline"
              size="xs"
              onClick={() => setActiveView('database-schema')}
              leftIcon={<Database className="w-3.5 h-3.5" />}
            >
              View RLS Data Isolation
            </Button>
          }
        />
        <CardContent noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">HOD</th>
                  <th className="py-3 px-5">Enrolled Students</th>
                  <th className="py-3 px-5">Faculty</th>
                  <th className="py-3 px-5">Avg Attendance</th>
                  <th className="py-3 px-5">Isolation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentMetrics.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{dept.hod_name}</td>
                    <td className="py-3.5 px-5 text-slate-800 font-mono">{dept.students}</td>
                    <td className="py-3.5 px-5 text-slate-800 font-mono">{dept.faculty}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900">{dept.attendance}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                        RLS Enforced
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supabase & Architectural Governance Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Database & Row Level Security (RLS) Status"
            subtitle="Department-specific records are strictly isolated"
            icon={<ShieldAlert className="w-4 h-4 text-purple-600" />}
          />
          <CardContent className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              EduFlow AI enforces strict multi-tenant department boundaries. Students and teachers cannot read or modify records belonging to other academic departments.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 font-mono text-[11px] space-y-1 text-slate-700">
              <p>POLICY &quot;Department members view classes&quot; ON public.classes</p>
              <p className="text-blue-600">USING (department_id = current_user_department_id() OR current_user_role() = &apos;admin&apos;);</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('database-schema')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Inspect Full 12-Table Schema
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Supabase PostgreSQL Backend Connectivity"
            subtitle={isConfigured ? 'Connected to Supabase Project' : 'Running in Local Preview Mode'}
            icon={<Database className="w-4 h-4 text-blue-600" />}
          />
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              {isConfigured && supabaseHealth?.isConnected ? (
                <Badge variant="success" size="sm">Connected</Badge>
              ) : isConfigured && !supabaseHealth?.isConnected ? (
                <Badge variant="warning" size="sm">Configured (Awaiting Sync)</Badge>
              ) : (
                <Badge variant="default" size="sm">Demo Mode (.env pending)</Badge>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">
              To connect your live Supabase database instance, set <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">.env</code> and run the migration in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">supabase/migrations/</code>.
            </p>
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('database-schema')}
              >
                Configuration Instructions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
