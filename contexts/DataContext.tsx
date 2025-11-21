import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Frontend, Backend, Server, ACL, ConfigVersion, AppSettings, Alert, User, Report } from '../types';
import { apiService, APIError } from '../services/apiService';
import { useToast } from './ToastContext';
import { generateInitialData } from '../services/mockDataService';

interface DataContextType {
  data: AppState;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addFrontend: (frontend: Omit<Frontend, 'id' | 'sessions' | 'requestsPerSec' | 'status'>) => Promise<void>;
  updateFrontend: (id: string, updates: Partial<Frontend>) => Promise<void>;
  deleteFrontend: (id: string) => Promise<void>;
  addBackend: (backend: Omit<Backend, 'id' | 'activeServers' | 'totalRequests'>) => Promise<void>;
  deleteBackend: (id: string) => Promise<void>;
  toggleServerStatus: (backendId: string, serverId: string) => Promise<void>;
  updateServerStatus: (backendId: string, serverId: string, status: 'up' | 'down' | 'maint') => Promise<void>;
  addACL: (acl: Omit<ACL, 'id'>) => Promise<void>;
  deleteACL: (id: string) => Promise<void>;
  saveConfig: (content: string, comment: string, author: string) => Promise<void>;
  rollbackConfig: (versionId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  generateReport: (type: 'pdf' | 'csv') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppState>(generateInitialData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);

  const handleError = (err: any, operation: string) => {
    const errorMessage = err instanceof APIError 
      ? err.message 
      : `Failed to ${operation}. Please check your connection.`;
    setError(errorMessage);
    showToast(errorMessage, 'error');
    console.error(`Error in ${operation}:`, err);
  };

  // Fetch all data from API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use dashboard endpoint to get aggregated data
      const response = await apiService.getDashboard();
      
      if (response.success && response.data) {
        setData(prevData => ({
          ...prevData,
          ...response.data,
          // Keep stats history for charts
          statsHistory: prevData.statsHistory
        }));
      }
    } catch (err) {
      handleError(err, 'fetch data');
      // Keep using existing data on error
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Initialize data and WebSocket
  useEffect(() => {
    // Only fetch data if authenticated
    const token = apiService.getToken();
    if (token) {
      refreshData();

      // Setup WebSocket for real-time updates
      const websocket = apiService.createWebSocket(
        (message) => {
          if (message.type === 'STATS_UPDATE' && message.data) {
            setData(prevData => {
              const newStatsHistory = [...prevData.statsHistory, message.data.stat].slice(-60);
              return {
                ...prevData,
                statsHistory: newStatsHistory,
                frontends: message.data.frontends || prevData.frontends,
                logs: message.data.logs ? [...message.data.logs, ...prevData.logs].slice(0, 100) : prevData.logs
              };
            });
          } else if (message.type === 'INITIAL_STATE' && message.data) {
            setData(prevData => ({
              ...prevData,
              ...message.data
            }));
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          showToast('Real-time connection lost. Data may not be up to date.', 'warning');
        }
      );

      setWs(websocket);

      return () => {
        if (websocket) {
          websocket.close();
        }
      };
    } else {
      setIsLoading(false);
    }
  }, [refreshData, showToast]);

  // ========== Frontends ==========

  const addFrontend = async (frontendData: Omit<Frontend, 'id' | 'sessions' | 'requestsPerSec' | 'status'>) => {
    try {
      const response = await apiService.createFrontend(frontendData);
      if (response.success) {
        showToast('Frontend created successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'create frontend');
      throw err;
    }
  };

  const updateFrontend = async (id: string, updates: Partial<Frontend>) => {
    try {
      const response = await apiService.updateFrontend(id, updates);
      if (response.success) {
        showToast('Frontend updated successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'update frontend');
      throw err;
    }
  };

  const deleteFrontend = async (id: string) => {
    try {
      const response = await apiService.deleteFrontend(id);
      if (response.success) {
        showToast('Frontend deleted successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete frontend');
      throw err;
    }
  };

  // ========== Backends ==========

  const addBackend = async (backendData: Omit<Backend, 'id' | 'activeServers' | 'totalRequests'>) => {
    try {
      const response = await apiService.createBackend(backendData);
      if (response.success) {
        showToast('Backend created successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'create backend');
      throw err;
    }
  };

  const deleteBackend = async (id: string) => {
    try {
      const response = await apiService.deleteBackend(id);
      if (response.success) {
        showToast('Backend deleted successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete backend');
      throw err;
    }
  };

  const toggleServerStatus = async (backendId: string, serverId: string) => {
    try {
      // Get current server status
      const backend = data.backends.find(b => b.id === backendId);
      const server = backend?.servers.find(s => s.id === serverId);
      
      if (server) {
        const newStatus = server.status === 'up' ? 'maint' : (server.status === 'maint' ? 'down' : 'up');
        await updateServerStatus(backendId, serverId, newStatus);
      }
    } catch (err) {
      handleError(err, 'toggle server status');
      throw err;
    }
  };

  const updateServerStatus = async (backendId: string, serverId: string, status: 'up' | 'down' | 'maint') => {
    try {
      const response = await apiService.updateServerStatus(backendId, serverId, status);
      if (response.success) {
        showToast(`Server status updated to ${status}`, 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'update server status');
      throw err;
    }
  };

  // ========== ACLs ==========

  const addACL = async (acl: Omit<ACL, 'id'>) => {
    try {
      const response = await apiService.createACL(acl);
      if (response.success) {
        showToast('ACL created successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'create ACL');
      throw err;
    }
  };

  const deleteACL = async (id: string) => {
    try {
      const response = await apiService.deleteACL(id);
      if (response.success) {
        showToast('ACL deleted successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete ACL');
      throw err;
    }
  };

  // ========== Configuration ==========

  const saveConfig = async (content: string, comment: string, author: string) => {
    try {
      const response = await apiService.saveConfig(content, comment, author);
      if (response.success) {
        showToast('Configuration saved successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'save configuration');
      throw err;
    }
  };

  const rollbackConfig = async (versionId: string) => {
    try {
      const response = await apiService.rollbackConfig(versionId);
      if (response.success) {
        showToast('Configuration rolled back successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'rollback configuration');
      throw err;
    }
  };

  // ========== Settings ==========

  const updateSettings = async (settings: Partial<AppSettings>) => {
    try {
      const response = await apiService.updateSettings(settings);
      if (response.success) {
        showToast('Settings updated successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'update settings');
      throw err;
    }
  };

  // ========== Alerts ==========

  const deleteAlert = async (id: string) => {
    try {
      const response = await apiService.deleteAlert(id);
      if (response.success) {
        showToast('Alert acknowledged', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete alert');
      throw err;
    }
  };

  // ========== Users ==========

  const addUser = async (user: Omit<User, 'id' | 'lastLogin'>) => {
    try {
      const response = await apiService.createUser(user);
      if (response.success) {
        showToast('User created successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'create user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        showToast('User deleted successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete user');
      throw err;
    }
  };

  // ========== Reports ==========

  const generateReport = async (type: 'pdf' | 'csv') => {
    try {
      const response = await apiService.generateReport(
        `${type.toUpperCase()} Report - ${new Date().toLocaleDateString()}`,
        type,
        data.users[0]?.name || 'System'
      );
      if (response.success) {
        showToast(`${type.toUpperCase()} report generated successfully`, 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'generate report');
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const response = await apiService.deleteReport(id);
      if (response.success) {
        showToast('Report deleted successfully', 'success');
        await refreshData();
      }
    } catch (err) {
      handleError(err, 'delete report');
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      isLoading,
      error,
      refreshData,
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
