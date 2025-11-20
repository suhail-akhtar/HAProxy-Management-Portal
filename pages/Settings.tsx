
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

export const Settings: React.FC = () => {
  const { data, updateSettings } = useData();
  const { toggleTheme, theme } = useTheme();
  const { addToast } = useToast();
  const [localSettings, setLocalSettings] = useState(data.settings);

  const handleSave = () => {
    updateSettings(localSettings);
    addToast('Settings updated successfully', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your dashboard preferences and connection.</p>
      </div>

      <Card title="Appearance">
         <div className="flex items-center justify-between py-2">
            <div>
               <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
               <p className="text-sm text-slate-500">Toggle dark/light theme for the dashboard</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
               <button 
                 onClick={() => theme !== 'light' && toggleTheme()} 
                 className={`px-3 py-1 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
               >
                 Light
               </button>
               <button 
                 onClick={() => theme !== 'dark' && toggleTheme()}
                 className={`px-3 py-1 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-600 shadow text-white' : 'text-slate-500'}`}
               >
                 Dark
               </button>
            </div>
         </div>
      </Card>

      <Card title="General Preferences">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Refresh Interval (seconds)</label>
               <input 
                 type="number" 
                 value={localSettings.refreshInterval}
                 onChange={e => setLocalSettings({...localSettings, refreshInterval: parseInt(e.target.value)})}
                 className="w-full max-w-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
               />
            </div>
            <div className="flex items-center space-x-3">
               <input 
                 type="checkbox" 
                 id="notif" 
                 checked={localSettings.notificationsEnabled}
                 onChange={e => setLocalSettings({...localSettings, notificationsEnabled: e.target.checked})}
                 className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
               />
               <label htmlFor="notif" className="text-sm text-slate-700 dark:text-slate-300">Enable Toast Notifications</label>
            </div>
         </div>
      </Card>

      <Card title="Connection">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Endpoint</label>
               <input 
                 type="text" 
                 value={localSettings.apiUrl}
                 onChange={e => setLocalSettings({...localSettings, apiUrl: e.target.value})}
                 className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
               />
               <p className="text-xs text-slate-500 mt-1">Endpoint for the HAProxy Stats socket or Data Plane API</p>
            </div>
         </div>
      </Card>

      <div className="flex justify-end">
         <Button size="lg" onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};
