
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Frontend, Backend, Server, ACL, ConfigVersion, AppSettings, Alert, User, Report } from '../types';
import { generateInitialData, generateNextTick, generateId } from '../services/mockDataService';

interface DataContextType {
  data: AppState;
  isLoading: boolean;
  addFrontend: (frontend: Omit<Frontend, 'id' | 'sessions' | 'requestsPerSec' | 'status'>) => void;
  updateFrontend: (id: string, updates: Partial<Frontend>) => void;
  deleteFrontend: (id: string) => void;
  addBackend: (backend: Omit<Backend, 'id' | 'activeServers' | 'totalRequests'>) => void;
  deleteBackend: (id: string) => void;
  toggleServerStatus: (backendId: string, serverId: string) => void;
  updateServerStatus: (backendId: string, serverId: string, status: 'up' | 'down' | 'maint') => void;
  addACL: (acl: Omit<ACL, 'id'>) => void;
  deleteACL: (id: string) => void;
  saveConfig: (content: string, comment: string, author: string) => void;
  rollbackConfig: (versionId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  deleteAlert: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  deleteUser: (id: string) => void;
  deleteReport: (id: string) => void;
  generateReport: (type: 'pdf' | 'csv') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const initial = generateInitialData();
    setData(initial);
    setIsLoading(false);
  }, []);

  // Real-time simulation loop
  useEffect(() => {
    if (!data) return;

    const intervalId = setInterval(() => {
      setData((prevData) => {
        if (!prevData) return null;
        
        const { newStatsHistory, newFrontends, newLog } = generateNextTick(prevData.statsHistory, prevData.frontends);
        
        const updatedLogs = newLog ? [newLog, ...prevData.logs].slice(0, 100) : prevData.logs;

        return {
          ...prevData,
          statsHistory: newStatsHistory,
          frontends: newFrontends,
          logs: updatedLogs
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [data?.statsHistory]);

  const addFrontend = (frontendData: Omit<Frontend, 'id' | 'sessions' | 'requestsPerSec' | 'status'>) => {
    setData(prev => {
      if (!prev) return null;
      const newFrontend: Frontend = {
        ...frontendData,
        id: generateId(),
        status: 'active',
        sessions: 0,
        requestsPerSec: 0
      };
      return { ...prev, frontends: [...prev.frontends, newFrontend] };
    });
  };

  const updateFrontend = (id: string, updates: Partial<Frontend>) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        frontends: prev.frontends.map(f => f.id === id ? { ...f, ...updates } : f)
      };
    });
  };

  const deleteFrontend = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, frontends: prev.frontends.filter(f => f.id !== id) };
    });
  };

  const addBackend = (backendData: Omit<Backend, 'id' | 'activeServers' | 'totalRequests'>) => {
    setData(prev => {
      if (!prev) return null;
      const newBackend: Backend = {
        ...backendData,
        id: generateId(),
        activeServers: backendData.servers.filter(s => s.status === 'up').length,
        totalRequests: 0
      };
      return { ...prev, backends: [...prev.backends, newBackend] };
    });
  };

  const deleteBackend = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, backends: prev.backends.filter(b => b.id !== id) };
    });
  };

  const toggleServerStatus = (backendId: string, serverId: string) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        backends: prev.backends.map(b => {
          if (b.id !== backendId) return b;
          const updatedServers = b.servers.map(s => {
            if (s.id !== serverId) return s;
            const newStatus = s.status === 'up' ? 'maint' : (s.status === 'maint' ? 'down' : 'up');
            return { ...s, status: newStatus, lastStatusChange: new Date().toISOString() } as Server;
          });
          return {
            ...b,
            servers: updatedServers,
            activeServers: updatedServers.filter(s => s.status === 'up').length
          };
        })
      };
    });
  };

  const updateServerStatus = (backendId: string, serverId: string, status: 'up' | 'down' | 'maint') => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        backends: prev.backends.map(b => {
          if (b.id !== backendId) return b;
          const updatedServers = b.servers.map(s => {
            if (s.id !== serverId) return s;
            return { ...s, status: status, lastStatusChange: new Date().toISOString() } as Server;
          });
          return {
            ...b,
            servers: updatedServers,
            activeServers: updatedServers.filter(s => s.status === 'up').length
          };
        })
      };
    });
  };

  const addACL = (aclData: Omit<ACL, 'id'>) => {
    setData(prev => {
      if (!prev) return null;
      const newACL = { ...aclData, id: generateId() };
      return { ...prev, acls: [...prev.acls, newACL] };
    });
  };

  const deleteACL = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, acls: prev.acls.filter(a => a.id !== id) };
    });
  };

  const saveConfig = (content: string, comment: string, author: string) => {
    setData(prev => {
      if (!prev) return null;
      const newVersion: ConfigVersion = {
        id: generateId(),
        version: prev.configHistory.length > 0 ? prev.configHistory[0].version + 1 : 1,
        content,
        timestamp: new Date().toISOString(),
        author,
        comment
      };
      return {
        ...prev,
        currentConfig: content,
        configHistory: [newVersion, ...prev.configHistory]
      };
    });
  };

  const rollbackConfig = (versionId: string) => {
    setData(prev => {
      if (!prev) return null;
      const targetVersion = prev.configHistory.find(v => v.id === versionId);
      if (!targetVersion) return prev;

      const newVersion: ConfigVersion = {
        id: generateId(),
        version: prev.configHistory[0].version + 1,
        content: targetVersion.content,
        timestamp: new Date().toISOString(),
        author: 'system',
        comment: `Rollback to version ${targetVersion.version}`
      };
      return {
        ...prev,
        currentConfig: targetVersion.content,
        configHistory: [newVersion, ...prev.configHistory]
      };
    });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, settings: { ...prev.settings, ...settings } };
    });
  };

  const deleteAlert = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, alerts: prev.alerts.filter(a => a.id !== id) };
    });
  };

  const addUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    setData(prev => {
      if (!prev) return null;
      const newUser: User = {
        ...userData,
        id: generateId(),
        lastLogin: new Date().toISOString()
      };
      return { ...prev, users: [...prev.users, newUser] };
    });
  };

  const deleteUser = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, users: prev.users.filter(u => u.id !== id) };
    });
  };

  const deleteReport = (id: string) => {
    setData(prev => {
      if (!prev) return null;
      return { ...prev, reports: prev.reports.filter(r => r.id !== id) };
    });
  };

  const generateReport = (type: 'pdf' | 'csv') => {
    setData(prev => {
      if (!prev) return null;
      const newReport: Report = {
        id: generateId(),
        title: `Manual Report Export ${new Date().toLocaleDateString()}`,
        type,
        generatedBy: 'Current User',
        date: new Date().toISOString(),
        size: '0 KB',
        status: 'generating'
      };
      
      // Simulate generation
      setTimeout(() => {
        setData(p => {
           if(!p) return null;
           return {
             ...p,
             reports: p.reports.map(r => r.id === newReport.id ? { ...r, status: 'ready', size: '1.2 MB' } : r)
           }
        });
      }, 3000);

      return { ...prev, reports: [newReport, ...prev.reports] };
    });
  };

  return (
    <DataContext.Provider value={{ 
      data: data as AppState, 
      isLoading,
      addFrontend,
      updateFrontend,
      deleteFrontend,
      addBackend,
      deleteBackend,
      toggleServerStatus,
      updateServerStatus,
      addACL,
      deleteACL,
      saveConfig,
      rollbackConfig,
      updateSettings,
      deleteAlert,
      addUser,
      deleteUser,
      deleteReport,
      generateReport
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
