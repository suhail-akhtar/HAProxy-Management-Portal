
import React, { createContext, useContext, useState } from 'react';
import { RouteName } from '../types';

interface NavigationContextType {
  currentRoute: RouteName;
  params: Record<string, any>;
  navigate: (route: RouteName, params?: Record<string, any>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<{ route: RouteName; params: any }[]>([
    { route: 'dashboard', params: {} }
  ]);

  const current = history[history.length - 1];

  const navigate = (route: RouteName, params: Record<string, any> = {}) => {
    setHistory((prev) => [...prev, { route, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        currentRoute: current.route, 
        params: current.params, 
        navigate, 
        goBack 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};
