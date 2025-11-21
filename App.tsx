
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { CommandPalette } from './components/ui/CommandPalette';
import { Icons } from './components/ui/Icons';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Frontends } from './pages/Frontends';
import { Backends } from './pages/Backends';
import { FrontendDetails } from './pages/FrontendDetails';
import { BackendDetails } from './pages/BackendDetails';
import { Servers } from './pages/Servers';
import { Configuration } from './pages/Configuration';
import { ACLs } from './pages/ACLs';
import { Settings } from './pages/Settings';
import { Monitoring } from './pages/Monitoring';
import { Alerts } from './pages/Alerts';
import { Certificates } from './pages/Certificates';
import { HighAvailability } from './pages/HighAvailability';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { Help } from './pages/Help';
import { Login } from './pages/Login';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium text-center flex items-center justify-center z-50 sticky top-0">
      <Icons.WifiOff className="h-4 w-4 mr-2" />
      You are currently offline. Changes may not be saved.
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentRoute } = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'frontends': return <Frontends />;
      case 'frontend-details': return <FrontendDetails />;
      case 'backends': return <Backends />;
      case 'backend-details': return <BackendDetails />;
      case 'servers': return <Servers />;
      case 'configuration': return <Configuration />;
      case 'acls': return <ACLs />;
      case 'settings': return <Settings />;
      case 'monitoring': return <Monitoring />;
      case 'alerts': return <Alerts />;
      case 'certificates': return <Certificates />;
      case 'ha': return <HighAvailability />;
      case 'analytics': return <Analytics />;
      case 'users': return <Users />;
      case 'reports': return <Reports />;
      case 'help': return <Help />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      <OfflineBanner />
      <CommandPalette />
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <NavigationProvider>
            <DataProvider>
              <AppContent />
            </DataProvider>
          </NavigationProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
