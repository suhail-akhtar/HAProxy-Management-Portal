
import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentRoute, navigate } = useNavigation();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getBreadcrumb = () => {
    switch(currentRoute) {
      case 'dashboard': return 'Dashboard';
      case 'frontends': return 'Frontends';
      case 'frontend-details': return 'Frontends / Details';
      case 'backends': return 'Backends';
      case 'backend-details': return 'Backends / Details';
      case 'servers': return 'Servers';
      case 'acls': return 'Access Control Lists';
      case 'configuration': return 'Global Configuration';
      case 'settings': return 'Settings';
      case 'monitoring': return 'Monitoring & Logs';
      case 'alerts': return 'Alerts & Notifications';
      case 'certificates': return 'SSL Certificates';
      case 'ha': return 'High Availability';
      case 'analytics': return 'Analytics';
      case 'users': return 'User Management';
      case 'reports': return 'Reports';
      case 'help': return 'Help & Documentation';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Icons.Menu className="h-6 w-6" />
        </button>
        
        <nav className="hidden sm:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
          <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer" onClick={() => navigate('dashboard')}>Overview</span>
          <Icons.ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
          <span className="text-slate-900 dark:text-white capitalize">{getBreadcrumb()}</span>
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden md:flex relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
             <Icons.Search className="h-4 w-4 text-slate-400 mr-2" />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-slate-400 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700">⌘K</span>
          </div>
          <input 
            type="text" 
            readOnly
            placeholder="Search..." 
            className="h-9 w-64 pl-9 pr-12 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none dark:text-white transition-colors cursor-default"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Icons.Moon className="h-5 w-5" /> : <Icons.Sun className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
             <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name.charAt(0)}
             </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { navigate('settings'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                   Settings
                </button>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                   Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
