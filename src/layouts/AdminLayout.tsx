import React, { type ReactNode, useState } from 'react';
import Header from '../components/Header.tsx';
import Sidebar from '../components/Sidebar.tsx';
import './AdminLayout.scss';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Header onMenuToggle={toggleSidebar} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="app-shell__overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      <div className="app-shell__body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="app-shell__content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;