
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';

export const ACLs: React.FC = () => {
  const { data, addACL, deleteACL } = useData();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newACL, setNewACL] = useState({
    name: '',
    frontendId: data.frontends[0]?.id || '',
    criterion: 'path_beg',
    value: '',
    action: 'deny',
    actionValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const frontend = data.frontends.find(f => f.id === newACL.frontendId);
    if (frontend) {
      addACL({
        ...newACL,
        frontendName: frontend.name,
        action: newACL.action as any
      });
      addToast('Access Control List created', 'success');
      setIsModalOpen(false);
      setNewACL({ ...newACL, name: '', value: '' });
    }
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete this ACL rule?')) {
      deleteACL(id);
      addToast('ACL rule deleted', 'info');
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Control Lists</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage traffic rules and routing logic.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icons.Filter className="h-4 w-4 mr-2" />
          Add ACL Rule
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
               <tr>
                 <th className="px-6 py-3">Name</th>
                 <th className="px-6 py-3">Frontend</th>
                 <th className="px-6 py-3">Criterion</th>
                 <th className="px-6 py-3">Value</th>
                 <th className="px-6 py-3">Action</th>
                 <th className="px-6 py-3 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
               {data.acls.map(acl => (
                 <tr key={acl.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                   <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{acl.name}</td>
                   <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{acl.frontendName}</td>
                   <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">{acl.criterion}</span>
                   </td>
                   <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{acl.value}</td>
                   <td className="px-6 py-4">
                      <Badge variant={acl.action === 'deny' ? 'error' : 'success'}>
                        {acl.action.toUpperCase()} {acl.actionValue ? `: ${acl.actionValue}` : ''}
                      </Badge>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button onClick={() => handleDelete(acl.id)} className="text-red-500 hover:text-red-700 p-2">
                       <Icons.Close className="h-4 w-4" />
                     </button>
                   </td>
                 </tr>
               ))}
               {data.acls.length === 0 && (
                 <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No ACLs configured.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New ACL Rule">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rule Name</label>
             <input type="text" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white" 
                value={newACL.name} onChange={e => setNewACL({...newACL, name: e.target.value})} placeholder="block_admin" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Frontend</label>
                <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
                  value={newACL.frontendId} onChange={e => setNewACL({...newACL, frontendId: e.target.value})}>
                  {data.frontends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Criterion</label>
                <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
                   value={newACL.criterion} onChange={e => setNewACL({...newACL, criterion: e.target.value})}>
                   <option value="path_beg">Path Begins With</option>
                   <option value="path_end">Path Ends With</option>
                   <option value="src">Source IP</option>
                   <option value="hdr(host)">Host Header</option>
                </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Value</label>
             <input type="text" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white" 
                value={newACL.value} onChange={e => setNewACL({...newACL, value: e.target.value})} placeholder="/admin" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Action</label>
                <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
                   value={newACL.action} onChange={e => setNewACL({...newACL, action: e.target.value})}>
                   <option value="allow">Allow</option>
                   <option value="deny">Deny</option>
                   <option value="use_backend">Use Backend</option>
                </select>
             </div>
             {newACL.action === 'use_backend' && (
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Backend</label>
                  <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
                     value={newACL.actionValue} onChange={e => setNewACL({...newACL, actionValue: e.target.value})}>
                     <option value="">Select...</option>
                     {data.backends.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
               </div>
             )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit">Create Rule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
