import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { DEMO_SUBJECTS } from '../../context/mockData';

export const ClassesView: React.FC = () => {
  const { currentRole, currentDepartment } = useAuth();
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const timetableByDay: Record<
    string,
    { code: string; name: string; time: string; room: string; teacher: string; credits: number; status?: string }[]
  > = {
    Mon: [
      {
        code: 'CS301',
        name: 'Design & Analysis of Algorithms',
        time: '09:00 AM – 10:30 AM',
        room: 'Room 304 (Lab Wing)',
        teacher: 'Dr. Sunita Rao',
        credits: 4,
        status: 'completed',
      },
      {
        code: 'CS304',
        name: 'Database Management Systems',
        time: '11:00 AM – 12:30 PM',
        room: 'Lecture Hall 2',
        teacher: 'Prof. Arvind Sharma',
        credits: 4,
        status: 'upcoming',
      },
      {
        code: 'CS308',
        name: 'Artificial Intelligence Lab',
        time: '02:00 PM – 04:00 PM',
        room: 'AI Research Lab 1',
        teacher: 'Dr. Sunita Rao',
        credits: 2,
        status: 'upcoming',
      },
    ],
    Tue: [
      {
        code: 'CS310',
        name: 'Computer Networks',
        time: '09:00 AM – 10:30 AM',
        room: 'Room 201',
        teacher: 'Dr. Sunita Rao',
        credits: 3,
      },
      {
        code: 'CS301',
        name: 'Design & Analysis of Algorithms',
        time: '11:00 AM – 12:30 PM',
        room: 'Room 304',
        teacher: 'Dr. Sunita Rao',
        credits: 4,
      },
      {
        code: 'CS304',
        name: 'Database Lab (SQL & Indexing)',
        time: '02:00 PM – 04:00 PM',
        room: 'Database Lab 2',
        teacher: 'Prof. Arvind Sharma',
        credits: 2,
      },
    ],
    Wed: [
      {
        code: 'CS304',
        name: 'Database Management Systems',
        time: '09:00 AM – 10:30 AM',
        room: 'Lecture Hall 2',
        teacher: 'Prof. Arvind Sharma',
        credits: 4,
      },
      {
        code: 'CS310',
        name: 'Computer Networks',
        time: '11:00 AM – 12:30 PM',
        room: 'Room 201',
        teacher: 'Dr. Sunita Rao',
        credits: 3,
      },
      {
        code: 'CS399',
        name: 'Industry Seminar & Project Consultation',
        time: '02:00 PM – 03:30 PM',
        room: 'Auditorium B',
        teacher: 'Dean Rajesh Varma',
        credits: 1,
      },
    ],
    Thu: [
      {
        code: 'CS301',
        name: 'Design & Analysis of Algorithms',
        time: '09:00 AM – 10:30 AM',
        room: 'Room 304',
        teacher: 'Dr. Sunita Rao',
        credits: 4,
      },
      {
        code: 'CS308',
        name: 'Artificial Intelligence (Theory)',
        time: '11:00 AM – 12:30 PM',
        room: 'AI Lab 1',
        teacher: 'Dr. Sunita Rao',
        credits: 3,
      },
    ],
    Fri: [
      {
        code: 'CS310',
        name: 'Computer Networks Lab',
        time: '09:00 AM – 11:00 AM',
        room: 'Networking Lab',
        teacher: 'Dr. Sunita Rao',
        credits: 2,
      },
      {
        code: 'CS304',
        name: 'Database Systems Revision & Problem Solving',
        time: '11:30 AM – 01:00 PM',
        room: 'Lecture Hall 2',
        teacher: 'Prof. Arvind Sharma',
        credits: 4,
      },
    ],
  };

  const currentClasses = timetableByDay[selectedDay] || [];

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
              <span className="text-xs text-blue-200">
                {currentRole === 'student' ? 'Enrolled Schedule' : 'Faculty Teaching Load'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Classes & Academic Timetable</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Verified classroom schedule, lecture slots, laboratory allocations, and faculty assignments.
            </p>
          </div>
        </div>
      </div>

      {/* Weekday Switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-bold transition-all',
              selectedDay === d ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {d === 'Mon'
              ? 'Monday'
              : d === 'Tue'
              ? 'Tuesday'
              : d === 'Wed'
              ? 'Wednesday'
              : d === 'Thu'
              ? 'Thursday'
              : 'Friday'}
          </button>
        ))}
      </div>

      {/* Daily Class Slots Grid */}
      <div className="space-y-3">
        {currentClasses.map((cls, idx) => (
          <Card key={idx} className="border border-slate-200 hover:border-slate-300 transition-all shadow-xs">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex flex-col items-center justify-center font-bold shrink-0">
                  <Clock className="w-4 h-4 text-blue-600 mb-0.5" />
                  <span className="text-[10px] uppercase font-mono">{selectedDay}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cls.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{cls.name}</h3>
                    <Badge variant="default" size="sm">
                      {cls.credits} Credits
                    </Badge>
                  </div>

                  <p className="text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {cls.time}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {cls.room}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {cls.teacher}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-semibold">
                  Scheduled Session
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Curriculum Summary */}
      <Card>
        <CardHeader
          title="Registered Subjects & Curriculum Weights"
          subtitle="Department of Computer Science & Engineering • Fall 2026 Term"
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_SUBJECTS.filter(s => s.department_id === currentDepartment.id).map(sub => (
              <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700">{sub.code}</span>
                  <span className="text-[11px] font-semibold text-slate-600">{sub.credits} Credits</span>
                </div>
                <p className="font-bold text-slate-900">{sub.name}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{sub.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
