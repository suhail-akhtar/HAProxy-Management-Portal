
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

export const Users: React.FC = () => {
  const { data, addUser, deleteUser } = useData();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser as any);
    addToast('User added successfully', 'success');
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: 'viewer' });
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      addToast('User deleted', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage system access and roles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Icons.UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card noPadding>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Last Login</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.users.map(user => (
              <tr key={user.id} className="bg-white dark:bg-slate-800">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === 'admin' ? 'success' : user.role === 'editor' ? 'info' : 'neutral'}>
                    {user.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {new Date(user.lastLogin).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                    <Icons.Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
             <input type="text" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white" 
                value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
             <input type="email" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white" 
                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
             <select className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white"
                value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
             </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
