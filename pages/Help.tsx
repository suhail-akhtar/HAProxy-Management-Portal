
import React from 'react';
import { Card } from '../components/ui/Card';
import { Icons } from '../components/ui/Icons';

export const Help: React.FC = () => {
  const shortcuts = [
    { key: 'Cmd + K', desc: 'Open Command Palette' },
    { key: 'Esc', desc: 'Close Modals / Menus' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Documentation</h1>
        <p className="text-slate-500 dark:text-slate-400">Guides and references for using HAProxy Manager.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Keyboard Shortcuts">
          <div className="space-y-3">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
                <span className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-200">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Start Guide">
          <div className="prose dark:prose-invert text-sm">
            <ul className="list-disc pl-4 space-y-2 text-slate-600 dark:text-slate-300">
              <li>
                <strong>Dashboard:</strong> Overview of your cluster health and real-time metrics.
              </li>
              <li>
                <strong>Frontends:</strong> Manage incoming connections and define how requests are routed.
              </li>
              <li>
                <strong>Backends:</strong> Configure server pools and load balancing algorithms.
              </li>
              <li>
                <strong>Configuration:</strong> Edit the global <code>haproxy.cfg</code> file with syntax checking.
              </li>
            </ul>
          </div>
        </Card>
        
        <Card title="Support">
           <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                 <Icons.Help className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                 <h3 className="font-semibold text-slate-900 dark:text-white">Need assistance?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Check our official documentation or contact the support team for enterprise assistance.
                 </p>
                 <a href="#" className="text-primary-600 hover:underline text-sm mt-2 inline-block">Visit Documentation &rarr;</a>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};
