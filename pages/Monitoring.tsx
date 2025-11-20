
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Icons } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ComposedChart,
  Area, 
  Line,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

type TimeRange = 'live' | '30m' | '1h' | '6h' | '12h' | '24h' | '7d';
type MetricKey = 'requestsPerSec' | 'responseTime' | 'errorRate' | 'activeConnections';

const METRIC_CONFIG: Record<MetricKey, { label: string; color: string; axis: 'left' | 'right'; type: 'area' | 'line' | 'bar' }> = {
  requestsPerSec: { label: 'Throughput (RPS)', color: '#0ea5e9', axis: 'left', type: 'area' },
  responseTime: { label: 'Latency (ms)', color: '#10b981', axis: 'right', type: 'line' },
  errorRate: { label: 'Error Rate (%)', color: '#ef4444', axis: 'right', type: 'bar' },
  activeConnections: { label: 'Connections', color: '#8b5cf6', axis: 'left', type: 'line' }
};

export const Monitoring: React.FC = () => {
  const { data } = useData();
  const [logFilter, setLogFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  
  // Chart State
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricKey, boolean>>({
    requestsPerSec: true,
    responseTime: true,
    errorRate: false,
    activeConnections: false
  });

  const filteredLogs = data.logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(logFilter.toLowerCase()) || log.source.toLowerCase().includes(logFilter.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Generate mock historical data when not in 'live' mode
  const chartData = useMemo(() => {
    if (timeRange === 'live') return data.statsHistory;

    const points = 50;
    const hoursMap: Record<string, number> = { 
      '30m': 0.5, 
      '1h': 1, 
      '6h': 6, 
      '12h': 12, 
      '24h': 24, 
      '7d': 168 
    };
    const hours = hoursMap[timeRange] || 1;
    const now = Date.now();

    return Array.from({ length: points }).map((_, i) => {
      const time = now - (hours * 3600000) + (i * (hours * 3600000) / points);
      const date = new Date(time);
      
      // Create readable labels
      let timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (timeRange === '7d' || timeRange === '24h') {
         // Include date for longer ranges
         timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${timeLabel}`;
      }

      // Create some wave patterns
      const t = i / 10;
      return {
        timestamp: time,
        timeLabel,
        requestsPerSec: Math.max(0, Math.floor(200 + Math.sin(t) * 100 + Math.random() * 50)),
        responseTime: Math.max(0, Math.floor(30 + Math.cos(t) * 10 + Math.random() * 20)),
        errorRate: Math.random() > 0.9 ? Math.random() * 5 : 0,
        activeConnections: Math.max(0, Math.floor(1000 + Math.sin(t + 2) * 500 + Math.random() * 100)),
      };
    });
  }, [timeRange, data.statsHistory]);

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monitoring & Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time performance metrics and log streaming.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <Icons.TrendUp className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Advanced Chart Section */}
      <Card className="flex-shrink-0" noPadding>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
            {(['live', '30m', '1h', '6h', '12h', '24h', '7d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  timeRange === range 
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {range === 'live' ? 'Live' : range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Metric Toggles */}
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => {
              const config = METRIC_CONFIG[key];
              const isActive = visibleMetrics[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleMetric(key)}
                  className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive 
                      ? 'bg-opacity-10 border-transparent' 
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? `${config.color}20` : undefined,
                    color: isActive ? config.color : undefined
                  }}
                >
                  <div 
                    className={`w-2 h-2 rounded-full mr-2 ${!isActive && 'bg-slate-300 dark:bg-slate-600'}`}
                    style={{ backgroundColor: isActive ? config.color : undefined }} 
                  />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-80 p-4">
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={chartData}>
               <defs>
                 <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
               <XAxis 
                  dataKey="timeLabel" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
               />
               <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Count / RPS', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10 } }} 
                />
               <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Time (ms) / %', angle: 90, position: 'insideRight', style: { fill: '#94a3b8', fontSize: 10 } }} 
               />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
               />
               <Legend verticalAlign="top" height={36} iconType="circle" />
               
               {visibleMetrics.requestsPerSec && (
                 <Area 
                   yAxisId={METRIC_CONFIG.requestsPerSec.axis}
                   type="monotone" 
                   dataKey="requestsPerSec" 
                   name={METRIC_CONFIG.requestsPerSec.label}
                   stroke={METRIC_CONFIG.requestsPerSec.color} 
                   fill="url(#colorRps)"
                   strokeWidth={2}
                   isAnimationActive={false}
                 />
               )}
               {visibleMetrics.responseTime && (
                 <Line 
                   yAxisId={METRIC_CONFIG.responseTime.axis}
                   type="monotone" 
                   dataKey="responseTime" 
                   name={METRIC_CONFIG.responseTime.label}
                   stroke={METRIC_CONFIG.responseTime.color} 
                   strokeWidth={2}
                   dot={false}
                   isAnimationActive={false}
                 />
               )}
               {visibleMetrics.activeConnections && (
                 <Line 
                   yAxisId={METRIC_CONFIG.activeConnections.axis}
                   type="monotone" 
                   dataKey="activeConnections" 
                   name={METRIC_CONFIG.activeConnections.label}
                   stroke={METRIC_CONFIG.activeConnections.color} 
                   strokeWidth={2}
                   dot={false}
                   strokeDasharray="5 5"
                   isAnimationActive={false}
                 />
               )}
               {visibleMetrics.errorRate && (
                 <Bar 
                   yAxisId={METRIC_CONFIG.errorRate.axis}
                   dataKey="errorRate" 
                   name={METRIC_CONFIG.errorRate.label}
                   fill={METRIC_CONFIG.errorRate.color} 
                   barSize={20}
                   radius={[4, 4, 0, 0]}
                   isAnimationActive={false}
                 />
               )}
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      </Card>

      {/* Logs Section */}
      <Card className="flex-1 flex flex-col min-h-0" noPadding>
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <div className="flex items-center space-x-4">
               <h3 className="font-semibold text-slate-700 dark:text-slate-200">Log Stream</h3>
               <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
               <select 
                 className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                 value={levelFilter}
                 onChange={(e) => setLevelFilter(e.target.value)}
               >
                 <option value="all">All Levels</option>
                 <option value="info">Info</option>
                 <option value="warn">Warning</option>
                 <option value="error">Error</option>
               </select>
               <div className="relative hidden sm:block">
                 <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search logs..." 
                   className="pl-7 pr-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                   value={logFilter}
                   onChange={(e) => setLogFilter(e.target.value)}
                 />
               </div>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={() => setIsPaused(!isPaused)} className={`text-xs px-2 py-1 rounded border ${isPaused ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {isPaused ? 'Paused' : 'Live'}
               </button>
               <Badge variant="neutral">{filteredLogs.length} Entries</Badge>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-0 font-mono text-xs">
            <table className="w-full text-left">
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.slice().reverse().map(log => (
                     <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 whitespace-nowrap text-slate-400 w-32">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap w-24">
                           <span className={`px-1.5 py-0.5 rounded ${
                              log.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                              log.level === 'warn' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              log.level === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                           }`}>
                              {log.level.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300 w-48 font-semibold">{log.source}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{log.message}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {filteredLogs.length === 0 && (
               <div className="p-8 text-center text-slate-500 italic">No logs matching filter criteria.</div>
            )}
         </div>
      </Card>
    </div>
  );
};
