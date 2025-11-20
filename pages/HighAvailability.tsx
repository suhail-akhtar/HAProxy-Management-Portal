
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Icons } from '../components/ui/Icons';

export const HighAvailability: React.FC = () => {
  const { data } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">High Availability Cluster</h1>
        <p className="text-slate-500 dark:text-slate-400">Cluster node status and synchronization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Visualization of Cluster */}
         <div className="relative flex items-center justify-center py-12 lg:col-span-2">
            <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-slate-200 dark:bg-slate-700 -z-10" />
            <div className="flex justify-between w-full max-w-4xl px-8">
               {data.haNodes.map((node) => (
                  <div key={node.id} className="flex flex-col items-center">
                     <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 bg-white dark:bg-slate-800 z-10 transition-all
                        ${node.status === 'online' 
                           ? 'border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                           : node.status === 'syncing' 
                              ? 'border-yellow-500 animate-pulse' 
                              : 'border-red-500'
                        }`}
                     >
                        <Icons.Server className={`h-10 w-10 ${node.status === 'online' ? 'text-green-600' : 'text-slate-400'}`} />
                        <div className="absolute -bottom-2 bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full uppercase font-bold">
                           {node.role}
                        </div>
                     </div>
                     <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{node.name}</h3>
                     <p className="text-xs text-slate-500">{node.address}</p>
                     {node.status !== 'online' && <span className="text-xs text-yellow-600 mt-1">{node.status}</span>}
                  </div>
               ))}
            </div>
         </div>

         <Card title="Node Status" className="lg:col-span-2" noPadding>
            <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                     <th className="px-6 py-3">Node Name</th>
                     <th className="px-6 py-3">Role</th>
                     <th className="px-6 py-3">Address</th>
                     <th className="px-6 py-3">Heartbeat</th>
                     <th className="px-6 py-3">Config Sync</th>
                     <th className="px-6 py-3">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.haNodes.map(node => (
                     <tr key={node.id} className="bg-white dark:bg-slate-800">
                        <td className="px-6 py-4 font-medium dark:text-white">{node.name}</td>
                        <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500">{node.role}</td>
                        <td className="px-6 py-4 text-slate-500">{node.address}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(node.lastHeartbeat).toLocaleTimeString()}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                              {node.configSyncStatus === 'synced' ? (
                                 <Icons.Success className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                 <Icons.Alert className="h-4 w-4 text-yellow-500 mr-2" />
                              )}
                              <span className="capitalize text-slate-600 dark:text-slate-300">{node.configSyncStatus.replace(/_/g, ' ')}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant={node.status === 'online' ? 'success' : node.status === 'syncing' ? 'warning' : 'error'}>
                              {node.status.toUpperCase()}
                           </Badge>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
    </div>
  );
};
