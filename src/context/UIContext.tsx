import React, { createContext, useState } from 'react';

interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export { useUI } from './useUI';
