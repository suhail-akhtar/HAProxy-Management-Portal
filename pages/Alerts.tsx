
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { useToast } from '../contexts/ToastContext';

export const Alerts: React.FC = () => {
  const { data, deleteAlert } = useData();
  const { addToast } = useToast();
  const activeAlerts = data.alerts.filter(a => a.active);
  const historyAlerts = data.alerts.filter(a => !a.active);

  const handleAck = (id: string) => {
     deleteAlert(id);
     addToast('Alert acknowledged', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts & Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage system alerts and notification rules.</p>
        </div>
        <Button>
          <Icons.Settings className="h-4 w-4 mr-2" />
          Configure Rules
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold dark:text-white">Active Alerts</h3>
               <Badge variant={activeAlerts.length > 0 ? 'error' : 'success'}>{activeAlerts.length} Active</Badge>
            </div>
            <div className="space-y-4">
               {activeAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-lg">
                     <Icons.Alert className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                     <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-800 dark:text-red-300">{alert.title}</h4>
                        <p className="text-sm text-red-700 dark:text-red-200 mt-1">{alert.description}</p>
                        <div className="flex items-center mt-2 text-xs text-red-600 dark:text-red-400 space-x-3">
                           <span>{new Date(alert.timestamp).toLocaleString()}</span>
                           {alert.metric && <span>Metric: {alert.metric} &gt; {alert.threshold}</span>}
                        </div>
                     </div>
                     <Button size="sm" variant="secondary" onClick={() => handleAck(alert.id)}>Acknowledge</Button>
                  </div>
               ))}
               {activeAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                     <Icons.CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                     <p>No active alerts. System is healthy.</p>
                  </div>
               )}
            </div>
         </Card>

         <div className="space-y-6">
            <Card title="Notification Channels">
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded text-blue-600 mr-3"><Icons.Menu className="h-4 w-4" /></div>
                        <div>
                           <p className="text-sm font-medium dark:text-white">Email</p>
                           <p className="text-xs text-slate-500">admin@haproxy.local</p>
                        </div>
                     </div>
                     <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded text-purple-600 mr-3"><Icons.Activity className="h-4 w-4" /></div>
                        <div>
                           <p className="text-sm font-medium dark:text-white">Slack</p>
                           <p className="text-xs text-slate-500">#ops-alerts</p>
                        </div>
                     </div>
                     <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
               </div>
            </Card>

            <Card title="Alert History">
               <div className="space-y-3">
                  {historyAlerts.map(alert => (
                     <div key={alert.id} className="text-sm border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-1">
                        <p className="font-medium dark:text-slate-300">{alert.title}</p>
                        <p className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleDateString()}</p>
                     </div>
                  ))}
                  {historyAlerts.length === 0 && <p className="text-xs text-slate-500">No history available.</p>}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};
