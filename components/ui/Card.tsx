import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, noPadding = false }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all duration-200 flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 min-h-0 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};