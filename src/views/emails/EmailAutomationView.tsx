import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Mail,
  Send,
  Clock,
  Server,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { DEMO_CLASSES } from '../../context/mockData';

export const EmailAutomationView: React.FC = () => {
  const { currentProfile, currentDepartment } = useAuth();
  const { scheduledEmails, scheduleEmail, cancelScheduledEmail, resendStatus } = useAcademic();

  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  // Form State
  const [recipientType, setRecipientType] = useState<'class' | 'semester' | 'department'>('class');
  const [recipientTarget, setRecipientTarget] = useState<string>('CSE 3rd Year - Section A');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<'immediate' | 'scheduled'>('scheduled');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const pendingEmails = scheduledEmails.filter(e => e.status === 'pending');
  const pastEmails = scheduledEmails.filter(e => e.status === 'sent' || e.status === 'cancelled' || e.status === 'failed');

  const handleSendOrSchedule = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill out the email subject and message body.');
      return;
    }

    const recipientCount =
      recipientType === 'class' ? 42 : recipientType === 'semester' ? 128 : 340;

    await scheduleEmail({
      teacher_id: currentProfile.id,
      teacher_name: currentProfile.full_name,
      recipient_type: recipientType,
      recipient_target: recipientTarget,
      recipient_count: recipientCount,
      subject,
      message,
      scheduled_time:
        deliveryMode === 'immediate'
          ? new Date().toISOString()
          : new Date(scheduledDateTime).toISOString(),
    });

    setComposeModalOpen(false);
    setSubject('');
    setMessage('');
  };

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
              <span className="text-xs text-blue-200">Department Circular Dispatch System</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Teacher Email Automation & Scheduled Broadcast</h2>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Compose announcements, target cohorts by section, semester, or department, and schedule automated dispatch with full audit logs.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setComposeModalOpen(true)}
            leftIcon={<Mail className="w-4 h-4" />}
            className="shadow-sm hover:shadow shrink-0"
          >
            Compose Email Circular
          </Button>
        </div>
      </div>

      {/* Provider Status & Configuration Banner */}
      <div
        className={clsx(
          'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
          resendStatus.isConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        )}
      >
        <div className="flex items-start sm:items-center gap-2.5">
          <Server className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-semibold text-xs">
              Delivery Gateway: {resendStatus.provider}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {resendStatus.isConfigured
                ? 'Production Resend API credentials active. Emails are dispatched via verified SMTP relays.'
                : 'Development Preview Mode: Scheduled delivery queue is simulated with local persistent state. To enable live email dispatch, add VITE_RESEND_API_KEY in .env.'}
            </p>
          </div>
        </div>

        <Badge variant={resendStatus.isConfigured ? 'success' : 'default'} size="sm" className="shrink-0 self-start sm:self-auto">
          {resendStatus.isConfigured ? 'Live SMTP Ready' : 'Simulated Gateway (Demo)'}
        </Badge>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('queue')}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'queue' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Scheduled Queue ({pendingEmails.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          Dispatch Ledger & History ({pastEmails.length})
        </button>
      </div>

      {/* Queue Content */}
      {activeTab === 'queue' ? (
        <Card>
          <CardHeader
            title="Pending Scheduled Broadcasts"
            subtitle="Emails queued for future automated execution"
          />
          <CardContent>
            {pendingEmails.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-medium text-slate-700">No emails currently scheduled in queue</p>
                <p>Click "Compose Email Circular" to schedule an announcement.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEmails.map(em => (
                  <div
                    key={em.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{em.subject}</span>
                        <Badge variant="warning" size="sm">
                          Queued for Delivery
                        </Badge>
                      </div>

                      <p className="text-slate-600">
                        Target: <span className="font-semibold text-slate-800">{em.recipient_target}</span> (
                        {em.recipient_count} recipients) • Scheduled for:{' '}
                        <span className="font-medium text-blue-700">
                          {new Date(em.scheduled_time).toLocaleString()}
                        </span>
                      </p>

                      <p className="text-slate-500 bg-slate-50 p-2.5 rounded-lg text-[11px] line-clamp-2">
                        {em.message}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => cancelScheduledEmail(em.id)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                        className="text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        Cancel Delivery
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* History / Audit Log */
        <Card>
          <CardHeader
            title="Broadcast Dispatch History"
            subtitle="Archive of sent announcements and cancellation records"
          />
          <CardContent>
            {pastEmails.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No past email records found.</p>
            ) : (
              <div className="space-y-3">
                {pastEmails.map(em => (
                  <div
                    key={em.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{em.subject}</span>
                        <Badge variant={em.status === 'sent' ? 'success' : 'danger'} size="sm">
                          {em.status === 'sent' ? 'Delivered' : 'Cancelled'}
                        </Badge>
                      </div>

                      <p className="text-slate-600">
                        Recipients: {em.recipient_target} ({em.recipient_count} total) • Dispatched by {em.teacher_name}
                      </p>

                      <p className="text-slate-500 text-[11px] line-clamp-2 bg-white p-2 rounded border border-slate-200">
                        {em.message}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {em.sent_at ? new Date(em.sent_at).toLocaleDateString() : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Compose Email Modal */}
      <Modal
        isOpen={composeModalOpen}
        onClose={() => setComposeModalOpen(false)}
        title="Compose Department Circular / Scheduled Email"
        description="Select recipient group and schedule dispatch date and time."
      >
        <div className="space-y-4 py-2 text-xs">
          {/* Recipient Targeting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Cohort Type</label>
              <select
                value={recipientType}
                onChange={e => setRecipientType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="class">Specific Class Section</option>
                <option value="semester">Entire Semester Cohort</option>
                <option value="department">All Department Students</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Group Name</label>
              {recipientType === 'class' ? (
                <select
                  value={recipientTarget}
                  onChange={e => setRecipientTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  {DEMO_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={recipientTarget}
                  onChange={e => setRecipientTarget(e.target.value)}
                  placeholder="e.g. All 6th Semester CSE Students"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Line</label>
            <input
              type="text"
              placeholder="e.g. Mid-Term Practical Exam Schedule and Hall Ticket Verification"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={4}
              placeholder="Enter official circular message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* Delivery Timing */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block font-semibold text-slate-700">Delivery Timing</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMode === 'immediate'}
                  onChange={() => setDeliveryMode('immediate')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Send Immediately</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMode === 'scheduled'}
                  onChange={() => setDeliveryMode('scheduled')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Schedule for Later</span>
              </label>
            </div>

            {deliveryMode === 'scheduled' && (
              <div className="pt-2">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={e => setScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setComposeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendOrSchedule}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {deliveryMode === 'immediate' ? 'Send Circular Now' : 'Queue Scheduled Email'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
