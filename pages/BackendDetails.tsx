
import React from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

export const BackendDetails: React.FC = () => {
  const { data, toggleServerStatus } = useData();
  const { params, goBack } = useNavigation();
  const backend = data.backends.find(b => b.id === params.id);

  if (!backend) return <div>Backend not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <Icons.ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {backend.name}
            <Badge variant="info">{backend.balance}</Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
             {backend.servers.length} Servers • {backend.activeServers} Active
          </p>
        </div>
      </div>

      <Card title="Server List" action={<Button size="sm"><Icons.Server className="h-4 w-4 mr-2"/> Add Server</Button>} noPadding>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Weight</th>
              <th className="px-6 py-3">Sessions</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {backend.servers.map((server) => (
              <tr key={server.id} className="bg-white dark:bg-slate-800">
                <td className="px-6 py-4">
                   <div className={`flex items-center text-xs font-medium uppercase ${server.status === 'up' ? 'text-green-600' : server.status === 'maint' ? 'text-yellow-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${server.status === 'up' ? 'bg-green-500' : server.status === 'maint' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      {server.status}
                   </div>
                </td>
                <td className="px-6 py-4 font-medium dark:text-white">{server.name}</td>
                <td className="px-6 py-4 text-slate-500">{server.address}:{server.port}</td>
                <td className="px-6 py-4 dark:text-slate-300">{server.weight}</td>
                <td className="px-6 py-4 text-slate-500">{server.currentSessions} / {server.totalSessions}</td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => toggleServerStatus(backend.id, server.id)}
                    className={server.status === 'maint' ? 'text-green-600' : 'text-yellow-600'}
                  >
                    {server.status === 'maint' ? 'Enable' : 'Drain'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
