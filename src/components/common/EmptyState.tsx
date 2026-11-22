import React from 'react';
import { Button } from './Button';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        'text-center py-12 px-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
