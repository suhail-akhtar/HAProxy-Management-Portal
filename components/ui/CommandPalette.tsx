
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './Icons';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { navigate } = useNavigation();
  const { toggleTheme } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { label: 'Go to Dashboard', icon: Icons.Dashboard, action: () => navigate('dashboard') },
    { label: 'Go to Frontends', icon: Icons.Network, action: () => navigate('frontends') },
    { label: 'Go to Backends', icon: Icons.Server, action: () => navigate('backends') },
    { label: 'Go to Servers', icon: Icons.Cpu, action: () => navigate('servers') },
    { label: 'Go to Reports', icon: Icons.FileText, action: () => navigate('reports') },
    { label: 'Go to Users', icon: Icons.Users, action: () => navigate('users') },
    { label: 'Go to Help', icon: Icons.Help, action: () => navigate('help') },
    { label: 'Toggle Theme', icon: Icons.Moon, action: () => toggleTheme() },
    { label: 'Logout', icon: Icons.LogOut, action: () => logout() },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setSearch('');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden transform transition-all">
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <Icons.Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredActions.length > 0 ? (
            <div className="px-2 space-y-1">
              {filteredActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action.action)}
                  className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <action.icon className="h-4 w-4 mr-3 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  {action.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
