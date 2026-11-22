import React from 'react';
import clsx from 'clsx';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'blue',
  change,
  className,
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <Card className={clsx('p-5 hoverable transition-all', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
            {change && (
              <span
                className={clsx(
                  'text-xs font-medium inline-flex items-center',
                  change.trend === 'up' && 'text-emerald-600',
                  change.trend === 'down' && 'text-rose-600',
                  change.trend === 'neutral' && 'text-slate-500'
                )}
              >
                {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '•'} {change.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-normal pt-0.5">{subtitle}</p>}
        </div>

        <div
          className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border',
            colorMap[iconColor]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
