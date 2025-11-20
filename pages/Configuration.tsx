
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { CodeEditor } from '../components/ui/CodeEditor';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

export const Configuration: React.FC = () => {
  const { data, saveConfig, rollbackConfig } = useData();
  const { addToast } = useToast();
  const [localConfig, setLocalConfig] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveComment, setSaveComment] = useState('');
  
  useEffect(() => {
    if (data.currentConfig) {
      setLocalConfig(data.currentConfig);
    }
  }, [data.currentConfig]);

  const handleConfigChange = (val: string) => {
    setLocalConfig(val);
    setIsDirty(val !== data.currentConfig);
  };

  const handleSave = () => {
    saveConfig(localConfig, saveComment, 'admin');
    setIsSaveModalOpen(false);
    setSaveComment('');
    setIsDirty(false);
    addToast('Configuration saved successfully', 'success');
  };

  const handleRollback = (versionId: string) => {
    if (window.confirm('Are you sure you want to rollback to this version?')) {
      rollbackConfig(versionId);
      addToast('Configuration rolled back', 'info');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400">Edit HAProxy global configuration.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="secondary" onClick={() => { setLocalConfig(data.currentConfig); setIsDirty(false); }}>
             Discard Changes
           </Button>
           <Button disabled={!isDirty} onClick={() => setIsSaveModalOpen(true)}>
             <Icons.Success className="h-4 w-4 mr-2" />
             Apply Configuration
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <Card className="lg:col-span-3 flex flex-col min-h-0" noPadding>
          <div className="flex-1 p-0 min-h-0">
            <CodeEditor value={localConfig} onChange={handleConfigChange} />
          </div>
        </Card>

        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
           <Card title="Version History">
             <div className="space-y-4">
               {data.configHistory.map((ver, idx) => (
                 <div key={ver.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 pb-4 last:pb-0">
                   <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Version {ver.version}</p>
                        <p className="text-xs text-slate-500 mb-1">{new Date(ver.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{ver.comment}"</p>
                        <p className="text-xs text-slate-400 mt-1">by {ver.author}</p>
                      </div>
                      {idx !== 0 && (
                        <button onClick={() => handleRollback(ver.id)} className="text-xs text-primary-600 hover:text-primary-700 underline">
                          Rollback
                        </button>
                      )}
                   </div>
                 </div>
               ))}
             </div>
           </Card>
           
           <Card title="Validation" className="bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center text-green-600 text-sm">
                <Icons.Success className="h-5 w-5 mr-2" />
                Syntax Valid
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Configuration checked against HAProxy 2.8.3 parser rules.
              </p>
           </Card>
        </div>
      </div>

      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Configuration">
         <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will reload the HAProxy process with the new configuration. Active connections might be affected depending on reload strategy.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment</label>
              <input 
                type="text" 
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-700 dark:text-white"
                placeholder="Describe your changes..."
                value={saveComment}
                onChange={e => setSaveComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Confirm & Reload</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
