import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUiStore } from '../../store/uiStore';
import { Toaster } from 'sonner';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="min-h-screen bg-[#080C12] text-[#E8EFF7] flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'pl-14' : 'pl-56'
        }`}
      >
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0D1520',
            border: '1px solid #233A52',
            color: '#E8EFF7',
          },
        }}
      />
    </div>
  );
};
