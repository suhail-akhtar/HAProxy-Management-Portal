
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

export const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center text-white">
            <Icons.Server className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            HAProxy Manager
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access the control panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="admin@haproxy.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full flex justify-center" isLoading={isLoading}>
              Sign in
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
              <span>Test credentials:</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 text-center space-y-1">
              <div>Admin: admin@haproxy.local / admin123</div>
              <div>Editor: devops@haproxy.local / devops123</div>
              <div>Viewer: viewer@haproxy.local / viewer123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
