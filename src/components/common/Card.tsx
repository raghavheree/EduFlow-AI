import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden',
        hoverable && 'transition-all duration-200 hover:border-slate-300 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  icon,
  className,
}) => {
  return (
    <div
      className={clsx(
        'px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            {typeof title === 'string' ? (
              <h3 className="font-semibold text-slate-900 text-sm tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 font-normal">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  noPadding = false,
  ...props
}) => {
  return (
    <div className={clsx(!noPadding && 'p-5', className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'px-5 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
