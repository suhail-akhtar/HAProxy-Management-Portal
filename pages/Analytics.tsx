
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const Analytics: React.FC = () => {
  const { data } = useData();
  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Traffic analysis and usage patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card title="Traffic by Hour (24h)">
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.analytics.trafficByHour}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                     <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        cursor={{fill: 'transparent'}}
                     />
                     <Bar dataKey="requests" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card title="Geographic Distribution">
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={data.analytics.geoDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="requests"
                        nameKey="country"
                     >
                        {data.analytics.geoDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card title="Top User Agents">
            <div className="space-y-4">
               {data.analytics.topBrowsers.map((browser, idx) => (
                  <div key={browser.name} className="relative pt-1">
                     <div className="flex mb-2 items-center justify-between">
                        <div className="text-sm font-medium dark:text-white">{browser.name}</div>
                        <div className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                           {browser.value}%
                        </div>
                     </div>
                     <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100 dark:bg-slate-800">
                        <div style={{ width: `${browser.value}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"></div>
                     </div>
                  </div>
               ))}
            </div>
         </Card>

         <Card title="Top Backends">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                     <tr>
                        <th className="px-4 py-2">Backend</th>
                        <th className="px-4 py-2">Total Requests</th>
                        <th className="px-4 py-2">Traffic Share</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {data.backends.sort((a, b) => b.totalRequests - a.totalRequests).slice(0, 5).map(b => (
                        <tr key={b.id}>
                           <td className="px-4 py-3 font-medium dark:text-white">{b.name}</td>
                           <td className="px-4 py-3 text-slate-500">{b.totalRequests.toLocaleString()}</td>
                           <td className="px-4 py-3">
                              <div className="flex items-center">
                                 <span className="text-xs mr-2 w-8 text-right">
                                    {Math.round((b.totalRequests / data.backends.reduce((acc, cur) => acc + cur.totalRequests, 0)) * 100)}%
                                 </span>
                                 <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                       className="h-full bg-green-500 rounded-full" 
                                       style={{ width: `${(b.totalRequests / data.backends.reduce((acc, cur) => acc + cur.totalRequests, 0)) * 100}%` }}
                                    />
                                 </div>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
    </div>
  );
};
