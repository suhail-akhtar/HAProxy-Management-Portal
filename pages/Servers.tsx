
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { useToast } from '../contexts/ToastContext';

export const Servers: React.FC = () => {
  const { data, updateServerStatus } = useData();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'down' | 'maint'>('all');
  const [backendFilter, setBackendFilter] = useState('all');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  // Flatten server list with backend info
  const allServers = useMemo(() => {
    return data.backends.flatMap(b => 
      b.servers.map(s => ({
        ...s,
        backendId: b.id,
        backendName: b.name
      }))
    );
  }, [data.backends]);

  const filteredServers = allServers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.address.includes(search);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesBackend = backendFilter === 'all' || s.backendId === backendFilter;
    return matchesSearch && matchesStatus && matchesBackend;
  });

  const toggleSelect = (id: string) => {
    setSelectedServers(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedServers.length === filteredServers.length) {
      setSelectedServers([]);
    } else {
      setSelectedServers(filteredServers.map(s => s.id));
    }
  };

  const handleBulkAction = (action: 'up' | 'down' | 'maint') => {
    selectedServers.forEach(sid => {
      const server = allServers.find(s => s.id === sid);
      if (server) {
        updateServerStatus(server.backendId, server.id, action);
      }
    });
    addToast(`Updated status for ${selectedServers.length} servers`, 'success');
    setSelectedServers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Server List</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor and manage all servers across the cluster.</p>
        </div>
        <div className="flex space-x-2">
          {selectedServers.length > 0 && (
             <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
               <Button size="sm" variant="ghost" className="rounded-none border-r border-slate-200 dark:border-slate-700 text-green-600 hover:text-green-700" onClick={() => handleBulkAction('up')}>Enable</Button>
               <Button size="sm" variant="ghost" className="rounded-none border-r border-slate-200 dark:border-slate-700 text-yellow-600 hover:text-yellow-700" onClick={() => handleBulkAction('maint')}>Drain</Button>
               <Button size="sm" variant="ghost" className="rounded-none text-red-600 hover:text-red-700" onClick={() => handleBulkAction('down')}>Disable</Button>
             </div>
          )}
        </div>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search servers..." 
                className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <select 
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="maint">Maintenance</option>
          </select>
          <select 
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={backendFilter}
            onChange={(e) => setBackendFilter(e.target.value)}
          >
            <option value="all">All Backends</option>
            {data.backends.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input type="checkbox" checked={selectedServers.length === filteredServers.length && filteredServers.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                </th>
                <th className="px-6 py-3">Server</th>
                <th className="px-6 py-3">Backend</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Sessions</th>
                <th className="px-6 py-3">Last Change</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredServers.map((server) => (
                <tr key={server.id} className={`bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedServers.includes(server.id) ? 'bg-slate-50 dark:bg-slate-800/80' : ''}`}>
                  <td className="px-6 py-4">
                     <input type="checkbox" checked={selectedServers.includes(server.id)} onChange={() => toggleSelect(server.id)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{server.name}</div>
                    <div className="text-xs text-slate-500">{server.address}:{server.port}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{server.backendName}</td>
                  <td className="px-6 py-4">
                    <Badge variant={server.status === 'up' ? 'success' : server.status === 'down' ? 'error' : 'warning'}>
                      {server.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {server.currentSessions} <span className="text-slate-400">/ {server.totalSessions}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(server.lastStatusChange).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="relative group inline-block text-left">
                        <Button size="sm" variant="ghost" className="p-1 h-8 w-8 rounded-full"><Icons.More className="h-4 w-4" /></Button>
                        {/* Dropdown simplified for this demo */}
                        <div className="hidden group-hover:block absolute right-0 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                           <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => updateServerStatus(server.backendId, server.id, 'up')}>Mark Active</button>
                              <button className="block w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => updateServerStatus(server.backendId, server.id, 'maint')}>Drain Traffic</button>
                              <button className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => updateServerStatus(server.backendId, server.id, 'down')}>Force Down</button>
                           </div>
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredServers.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
               No servers found matching your filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
