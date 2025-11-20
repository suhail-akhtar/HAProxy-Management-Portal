
import React from 'react';
import { Icons } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200',
  };

  const Icon = {
    success: Icons.Success,
    error: Icons.Error,
    warning: Icons.Alert,
    info: Icons.Activity,
  }[type];

  return (
    <div className={`flex items-center p-4 mb-2 rounded-lg border shadow-sm w-80 transition-all duration-300 ${styles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mr-3" />
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <Icons.Close className="w-4 h-4" />
      </button>
    </div>
  );
};
