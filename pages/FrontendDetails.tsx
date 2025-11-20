
import React from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FrontendDetails: React.FC = () => {
  const { data } = useData();
  const { params, goBack } = useNavigation();
  const frontend = data.frontends.find(f => f.id === params.id);

  if (!frontend) return <div>Frontend not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <Icons.ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {frontend.name}
            <Badge variant={frontend.status === 'active' ? 'success' : 'error'}>{frontend.status}</Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {frontend.bind}:{frontend.port} • {frontend.mode.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Configuration" className="md:col-span-1">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Default Backend</span>
              <span className="font-medium text-slate-900 dark:text-white">{frontend.defaultBackend}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Max Connections</span>
              <span className="font-medium text-slate-900 dark:text-white">{frontend.maxConnections}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Current Sessions</span>
              <span className="font-medium text-slate-900 dark:text-white">{frontend.sessions}</span>
            </div>
          </div>
        </Card>

        <Card title="Traffic Overview" className="md:col-span-2 h-80">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data.statsHistory}>
               <defs>
                 <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
               <XAxis dataKey="timeLabel" hide />
               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip />
               <Area type="monotone" dataKey="requestsPerSec" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRps)" />
             </AreaChart>
           </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Recent Logs" noPadding>
        <div className="p-6 text-center text-slate-500">
          No specific logs found for this frontend.
        </div>
      </Card>
    </div>
  );
};
