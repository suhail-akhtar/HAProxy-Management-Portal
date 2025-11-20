
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';

export const Backends: React.FC = () => {
  const { data, addBackend, deleteBackend } = useData();
  const { navigate } = useNavigation();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBackendName, setNewBackendName] = useState('');

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBackend({
      name: newBackendName,
      mode: 'http',
      balance: 'roundrobin',
      servers: []
    });
    setIsModalOpen(false);
    setNewBackendName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Backends</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage server pools and load balancing algorithms.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icons.Server className="h-4 w-4 mr-2" />
          Add Backend
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="w-8 px-6 py-3"></th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Algorithm</th>
                <th className="px-6 py-3">Servers</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.backends.map((be) => (
                <React.Fragment key={be.id}>
                  <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleRow(be.id)} className="text-slate-400 hover:text-primary-500">
                         <Icons.ChevronRight className={`h-4 w-4 transition-transform ${expandedRows.has(be.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{be.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 uppercase">{be.mode}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{be.balance}</td>
                    <td className="px-6 py-4">
                       <Badge variant={be.activeServers === be.servers.length ? 'success' : be.activeServers === 0 ? 'error' : 'warning'}>
                         {be.activeServers} / {be.servers.length} UP
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => navigate('backend-details', { id: be.id })}>
                        Manage
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteBackend(be.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(be.id) && (
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                           {be.servers.map(server => (
                             <div key={server.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                               <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${server.status === 'up' ? 'bg-green-500' : server.status === 'maint' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                  <div>
                                    <p className="text-sm font-medium dark:text-white">{server.name}</p>
                                    <p className="text-xs text-slate-500">{server.address}:{server.port}</p>
                                  </div>
                               </div>
                               <Badge variant="neutral">{server.weight}</Badge>
                             </div>
                           ))}
                           {be.servers.length === 0 && <p className="text-sm text-slate-500 italic">No servers configured</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Backend">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
             <input 
                type="text" 
                value={newBackendName} 
                onChange={e => setNewBackendName(e.target.value)} 
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="app_backend"
                required
             />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Backend</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
