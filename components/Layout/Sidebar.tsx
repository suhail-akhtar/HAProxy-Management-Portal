
import React from 'react';
import { Icons } from '../ui/Icons';
import { useNavigation } from '../../contexts/NavigationContext';
import { RouteName } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRoute, navigate } = useNavigation();
  const { user } = useAuth();
  
  const navItems: { icon: any; label: string; route: RouteName; role?: string }[] = [
    { icon: Icons.Dashboard, label: 'Dashboard', route: 'dashboard' },
    { icon: Icons.Activity, label: 'Monitoring', route: 'monitoring' },
    { icon: Icons.TrendUp, label: 'Analytics', route: 'analytics' },
    { icon: Icons.Alert, label: 'Alerts', route: 'alerts' },
    { icon: Icons.Network, label: 'Frontends', route: 'frontends' },
    { icon: Icons.Server, label: 'Backends', route: 'backends' },
    { icon: Icons.Cpu, label: 'Servers', route: 'servers' },
    { icon: Icons.Zap, label: 'HA Cluster', route: 'ha' },
    { icon: Icons.Filter, label: 'ACLs', route: 'acls' },
    { icon: Icons.Settings, label: 'Configuration', route: 'configuration' },
    { icon: Icons.CheckCircle2, label: 'Certificates', route: 'certificates' },
    { icon: Icons.FileText, label: 'Reports', route: 'reports' },
    { icon: Icons.Users, label: 'Users', route: 'users', role: 'admin' },
    { icon: Icons.Menu, label: 'Settings', route: 'settings' },
    { icon: Icons.Help, label: 'Help', route: 'help' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Icons.Server className="h-6 w-6 text-primary-500 mr-3" />
          <span className="text-lg font-bold text-white tracking-tight">HAProxy Mgr</span>
          <button className="ml-auto lg:hidden text-slate-400" onClick={onClose}>
            <Icons.Close className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navItems.filter(item => !item.role || item.role === user?.role).map((item) => {
             const isActive = currentRoute === item.route || (currentRoute.startsWith(item.route.slice(0, -1)) && item.route !== 'dashboard');
             return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {user && (
          <div className="w-full p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-3 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
