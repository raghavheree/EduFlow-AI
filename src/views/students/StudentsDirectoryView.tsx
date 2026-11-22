import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Search,
} from 'lucide-react';
import clsx from 'clsx';

export const StudentsDirectoryView: React.FC = () => {
  const { currentDepartment } = useAuth();
  const { studentsRoster, getStudentAttendanceSummary } = useAcademic();

  const [search, setSearch] = useState('');

  const filtered = studentsRoster.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.roll.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
              <span className="text-xs text-blue-200">Departmental Directory</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Student Roster & Cohort Records</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Active student enrollments, attendance standing, and academic advisor contacts.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name or enrollment number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Cohort:</span>
          <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            CSE 3rd Year (Section A)
          </span>
        </div>
      </div>

      {/* Student List Table */}
      <Card>
        <CardHeader
          title={`Enrolled Students (${filtered.length} Active)`}
          subtitle="Real-time attendance calculations and academic standing"
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 px-4">Student Name</th>
                  <th className="pb-3 px-4">Enrollment ID</th>
                  <th className="pb-3 px-4">Cohort</th>
                  <th className="pb-3 px-4">Attendance Standing</th>
                  <th className="pb-3 pl-4">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((st, idx) => {
                  const summary = getStudentAttendanceSummary(st.id);
                  const isShortage = summary.overallPercentage < 75.0;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pr-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{st.name}</p>
                            <p className="text-[10px] text-slate-400">{st.name.toLowerCase().replace(' ', '.')}@eduflow.edu</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{st.roll}</td>
                      <td className="py-3 px-4 text-slate-600">Year 3 • Sem 6 (Sec A)</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'font-bold font-mono text-xs',
                              isShortage ? 'text-rose-600' : 'text-emerald-700'
                            )}
                          >
                            {summary.overallPercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({summary.totalAttended}/{summary.totalConducted} classes)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pl-4">
                        <Badge variant={isShortage ? 'danger' : 'success'} size="sm">
                          {isShortage ? 'Attendance Shortage' : 'Good Standing'}
                        </Badge>
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
  );
};
