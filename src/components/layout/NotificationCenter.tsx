import React, { useState, useRef, useEffect } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useUI } from '../../context/UIContext';
import { Badge } from '../common/Badge';
import {
  Bell,
  Trash2,
  Calendar,
  FileText,
  Sparkles,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import type { AppNotification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    pushPermission,
    requestPushNotificationPermission,
  } = useAcademic();

  const { setActiveView } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = notifications.filter(n => (activeTab === 'unread' ? !n.is_read : true));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="w-3.5 h-3.5 text-emerald-600" />;
      case 'notice':
        return <Bell className="w-3.5 h-3.5 text-blue-600" />;
      case 'assignment':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case 'ai_alert':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.action_view) {
      setActiveView(notif.action_view);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label="Academic Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Academic Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="danger" size="sm">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold p-1"
                title="Mark all as read"
              >
                Mark Read
              </button>
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-rose-600 p-1"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Push Permission Banner */}
          {pushPermission !== 'granted' && (
            <div className="mx-3 mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-center justify-between gap-2">
              <span className="text-[11px] text-purple-900 font-medium">
                Enable desktop push alerts for exam & notice updates?
              </span>
              <button
                onClick={requestPushNotificationPermission}
                className="px-2 py-1 bg-purple-600 text-white rounded font-bold text-[10px] hover:bg-purple-700 shrink-0"
              >
                Enable
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="px-3 pt-2 flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-semibold transition-all',
                activeTab === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={clsx(
                'px-2.5 py-1 rounded-md font-semibold transition-all',
                activeTab === 'unread' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-2 px-1">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No notifications to show</p>
            ) : (
              filtered.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={clsx(
                    'p-3 hover:bg-slate-50 cursor-pointer transition-colors rounded-lg flex items-start gap-3 text-xs',
                    !notif.is_read ? 'bg-blue-50/40' : 'bg-white'
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={clsx(
                          'leading-tight',
                          !notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
