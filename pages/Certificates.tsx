
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';

export const Certificates: React.FC = () => {
  const { data } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SSL Certificates</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage TLS certificates and encryption keys.</p>
        </div>
        <Button>
          <Icons.CheckCircle2 className="h-4 w-4 mr-2" />
          Upload Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {data.certificates.map(cert => (
            <Card key={cert.id} className="relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-1 h-full ${
                  cert.status === 'valid' ? 'bg-green-500' : cert.status === 'expiring' ? 'bg-yellow-500' : 'bg-red-500'
               }`} />
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">{cert.domain}</h3>
                     <p className="text-xs text-slate-500">{cert.issuer}</p>
                  </div>
                  <Badge variant={cert.status === 'valid' ? 'success' : cert.status === 'expiring' ? 'warning' : 'error'}>
                     {cert.status.toUpperCase()}
                  </Badge>
               </div>
               
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                     <span className="text-slate-500">Expires</span>
                     <span className="font-medium dark:text-slate-300">{new Date(cert.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Serial</span>
                     <span className="font-mono text-xs dark:text-slate-400">{cert.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Auto Renew</span>
                     <span className={cert.autoRenew ? 'text-green-600' : 'text-slate-400'}>
                        {cert.autoRenew ? 'Enabled' : 'Disabled'}
                     </span>
                  </div>
               </div>
               
               <div className="mt-6 flex space-x-2">
                  <Button size="sm" variant="secondary" className="flex-1">Details</Button>
                  <Button size="sm" variant="secondary" className="flex-1">Renew</Button>
               </div>
            </Card>
         ))}
         
         <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors mb-4">
               <Icons.CheckCircle2 className="h-8 w-8 text-slate-400 group-hover:text-primary-500" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary-600">Add New Certificate</span>
            <span className="text-xs text-slate-400 mt-1">PEM, CRT, or KEY files</span>
         </button>
      </div>
    </div>
  );
};
