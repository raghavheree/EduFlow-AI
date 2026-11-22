import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../common/Skeleton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useUI();
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar />

      {/* Primary Application Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Navigation */}
        <Header />

        {/* Dynamic Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-28 w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
