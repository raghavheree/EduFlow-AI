import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  DownloadCloud,
  Bell,
  Database,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { campusName, academicYear, currentTerm } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* PWA Installation Card */}
      <Card>
        <CardHeader
          title="Progressive Web App (PWA) Settings"
          subtitle="Install EduFlow AI on desktop or mobile for instant offline access"
          icon={<DownloadCloud className="w-5 h-5 text-blue-600" />}
        />
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Install EduFlow AI PWA</h4>
              <p className="text-slate-600 text-xs mt-0.5">
                Add to your mobile home screen or install as a native desktop application with offline caching.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('PWA Service Worker and Web App Manifest are active and configured.');
              }}
              leftIcon={<DownloadCloud className="w-4 h-4" />}
            >
              Install App
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Preferences */}
      <Card>
        <CardHeader
          title="Notification Preferences"
          subtitle="Configure real-time academic alerts and digest emails"
          icon={<Bell className="w-5 h-5 text-emerald-600" />}
        />
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">Attendance Sync & Threshold Warnings</p>
              <p className="text-slate-500 text-[11px]">Notify immediately when attendance dips below 75%.</p>
            </div>
            <input
              type="checkbox"
              checked={attendanceAlerts}
              onChange={(e) => setAttendanceAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900">Faculty Scheduled Circulars & Notices</p>
              <p className="text-slate-500 text-[11px]">Receive department circulars and exam schedules via email.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-slate-900">AI Syllabus & Exam Insights</p>
              <p className="text-slate-500 text-[11px]">Automated topic prioritization recommendations prior to exams.</p>
            </div>
            <input
              type="checkbox"
              checked={aiSuggestions}
              onChange={(e) => setAiSuggestions(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campus Configuration Overview */}
      <Card>
        <CardHeader
          title="Campus & Environment Parameters"
          subtitle="Configured via environment variables (.env)"
          icon={<Database className="w-5 h-5 text-purple-600" />}
        />
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Institution Name</span>
              <p className="font-medium text-slate-800 text-sm mt-0.5">{campusName}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Academic Session</span>
              <p className="font-medium text-slate-800 text-sm mt-0.5">{academicYear} ({currentTerm})</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
