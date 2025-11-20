
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { FrontendForm } from '../components/forms/FrontendForm';

export const Frontends: React.FC = () => {
  const { data, addFrontend, deleteFrontend, updateFrontend } = useData();
  const { navigate } = useNavigation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAdd = (formData: any) => {
    addFrontend(formData);
    setIsAddModalOpen(false);
  };

  const toggleStatus = (id: string, currentStatus: 'active' | 'stopped') => {
    updateFrontend(id, { status: currentStatus === 'active' ? 'stopped' : 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Frontends</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage incoming traffic listeners and routing.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Icons.Network className="h-4 w-4 mr-2" />
          Add Frontend
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Bind</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Sessions</th>
                <th className="px-6 py-3">Req/Sec</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.frontends.map((fe) => (
                <tr key={fe.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{fe.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant={fe.status === 'active' ? 'success' : 'error'}>
                      {fe.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fe.bind}:{fe.port}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 uppercase">{fe.mode}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fe.sessions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fe.requestsPerSec}/s</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate('frontend-details', { id: fe.id })}>
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleStatus(fe.id, fe.status)}
                      className={fe.status === 'active' ? 'text-red-600' : 'text-green-600'}
                    >
                      {fe.status === 'active' ? 'Stop' : 'Start'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteFrontend(fe.id)}>
                      <Icons.Close className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Frontend"
      >
        <FrontendForm onSubmit={handleAdd} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
};
