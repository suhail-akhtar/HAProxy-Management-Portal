
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';

interface FrontendFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export const FrontendForm: React.FC<FrontendFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { data } = useData();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    bind: initialData?.bind || '*',
    port: initialData?.port || 80,
    mode: initialData?.mode || 'http',
    defaultBackend: initialData?.defaultBackend || '',
    maxConnections: initialData?.maxConnections || 2000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.match(/^[a-zA-Z0-9_-]+$/)) {
      newErrors.name = 'Name must be alphanumeric with dashes/underscores';
    }
    if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535';
    }
    if (!formData.defaultBackend) {
      newErrors.defaultBackend = 'Default backend is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
            placeholder="web_frontend"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bind IP</label>
          <input
            type="text"
            value={formData.bind}
            onChange={e => setFormData({ ...formData, bind: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
            placeholder="*"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Port</label>
          <input
            type="number"
            value={formData.port}
            onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
          />
          {errors.port && <p className="mt-1 text-xs text-red-500">{errors.port}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mode</label>
          <select
            value={formData.mode}
            onChange={e => setFormData({ ...formData, mode: e.target.value as 'http' | 'tcp' })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
          >
            <option value="http">HTTP</option>
            <option value="tcp">TCP</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Backend</label>
          <select
            value={formData.defaultBackend}
            onChange={e => setFormData({ ...formData, defaultBackend: e.target.value })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
          >
            <option value="">Select Backend...</option>
            {data?.backends.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          {errors.defaultBackend && <p className="mt-1 text-xs text-red-500">{errors.defaultBackend}</p>}
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Connections</label>
          <input
            type="number"
            value={formData.maxConnections}
            onChange={e => setFormData({ ...formData, maxConnections: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Frontend</Button>
      </div>
    </form>
  );
};
