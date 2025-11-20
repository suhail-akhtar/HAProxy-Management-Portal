import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Icons } from '../components/ui/Icons';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useData } from '../contexts/DataContext';
import { LogEntry, Server } from '../types';

const KPICard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
        <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">{subValue}</p>
      </div>
      <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : trend === 'down' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-2 rounded shadow-lg text-xs border border-slate-700">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {Number(entry.value).toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const { data, isLoading } = useData();

  // Derived State
  const activeServers = useMemo(() => {
    if (!data) return 0;
    return data.backends.reduce((acc, backend) => acc + backend.activeServers, 0);
  }, [data]);

  const totalServers = useMemo(() => {
    if (!data) return 0;
    return data.backends.reduce((acc, backend) => acc + backend.servers.length, 0);
  }, [data]);

  const currentRps = useMemo(() => {
    if (!data || data.statsHistory.length === 0) return 0;
    return data.statsHistory[data.statsHistory.length - 1].requestsPerSec;
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitoring cluster status and performance metrics.</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="hidden sm:flex items-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
             System Operational
           </div>
           <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
             <Icons.Activity className="h-4 w-4 mr-2" />
             Generate Report
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Frontends" 
          value={data.frontends.length} 
          subValue="All active" 
          icon={Icons.Network}
          trend="neutral"
        />
        <KPICard 
          title="Active Servers" 
          value={`${activeServers} / ${totalServers}`}
          subValue={`${((activeServers / totalServers) * 100).toFixed(0)}% Availability`} 
          icon={Icons.Server}
          trend={activeServers === totalServers ? 'up' : 'down'}
        />
        <KPICard 
          title="Requests / Sec" 
          value={currentRps} 
          subValue="Current Load" 
          icon={Icons.Zap}
          trend="up"
        />
        <KPICard 
          title="Avg Response" 
          value={`${data.statsHistory[data.statsHistory.length - 1].responseTime}ms`} 
          subValue="Last 60s avg" 
          icon={Icons.Clock}
          trend="neutral"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Throughput (Req/Sec)" className="h-96">
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
               <Tooltip content={<CustomTooltip />} />
               <Area 
                 type="monotone" 
                 dataKey="requestsPerSec" 
                 stroke="#0ea5e9" 
                 strokeWidth={2}
                 fillOpacity={1} 
                 fill="url(#colorRps)" 
                 isAnimationActive={false}
               />
             </AreaChart>
           </ResponsiveContainer>
        </Card>

        <Card title="Response Time & Errors" className="h-96">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data.statsHistory}>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
               <XAxis dataKey="timeLabel" hide />
               <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} tickLine={false} axisLine={false} />
               <Tooltip content={<CustomTooltip />} />
               <Line 
                 yAxisId="left"
                 type="monotone" 
                 dataKey="responseTime" 
                 stroke="#10b981" 
                 strokeWidth={2} 
                 dot={false}
                 isAnimationActive={false}
                 name="Latency (ms)"
               />
               <Line 
                 yAxisId="right"
                 type="monotone" 
                 dataKey="errorRate" 
                 stroke="#ef4444" 
                 strokeWidth={2} 
                 dot={false}
                 isAnimationActive={false}
                 name="Errors"
               />
             </LineChart>
           </ResponsiveContainer>
        </Card>
      </div>

      {/* Activity & Status Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Logs */}
        <Card title="Recent Activity" className="lg:col-span-2" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.logs.map((log: LogEntry) => (
                  <tr key={log.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.level === 'info' && <Icons.Activity className="h-4 w-4 text-blue-500" />}
                      {log.level === 'warn' && <Icons.Alert className="h-4 w-4 text-yellow-500" />}
                      {log.level === 'error' && <Icons.Error className="h-4 w-4 text-red-500" />}
                      {log.level === 'success' && <Icons.Success className="h-4 w-4 text-green-500" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-200">{log.source}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{log.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                       {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {data.logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No recent logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Backend Health Status Summary */}
        <Card title="Backend Status" noPadding>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.backends.map((backend) => (
              <div key={backend.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{backend.name}</h4>
                  <div className="flex items-center mt-1 space-x-2">
                     <span className="text-xs text-slate-500">{backend.balance}</span>
                     <span className="text-slate-300 dark:text-slate-600">•</span>
                     <span className="text-xs text-slate-500">{backend.mode}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={backend.activeServers === backend.servers.length ? 'success' : backend.activeServers === 0 ? 'error' : 'warning'}>
                    {backend.activeServers} / {backend.servers.length} UP
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
            <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              View All Backends &rarr;
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};