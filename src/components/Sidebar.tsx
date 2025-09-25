import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import './Sidebar.scss';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { authState } = useAuth();
  const location = useLocation();

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking a link
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__section">
        <h3 className="sidebar__title">Control Panel</h3>
        <nav className="sidebar__nav">
          {/* Admin-only navigation */}
          {authState.user?.isAdmin && (
            <>
              <Link 
                to="/admin"
                className={`sidebar__nav-item ${location.pathname === '/' ? 'sidebar__nav-item--active' : ''}`}
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/users" 
                className={`sidebar__nav-item ${location.pathname === '/admin/users' ? 'sidebar__nav-item--active' : ''}`}
                onClick={handleLinkClick}
              >
                Users
              </Link>
              <Link 
                to="/admin/monitoring" 
                className={`sidebar__nav-item ${location.pathname === '/admin/monitoring' ? 'sidebar__nav-item--active' : ''}`}
                onClick={handleLinkClick}
              >
                Monitoring
              </Link>
              <Link 
                to="/admin/error-logs" 
                className={`sidebar__nav-item ${location.pathname === '/admin/error-logs' ? 'sidebar__nav-item--active' : ''}`}
                onClick={handleLinkClick}
              >
                Error Logs
              </Link>
              <Link 
                to="/admin/node-builder" 
                className={`sidebar__nav-item ${location.pathname.startsWith('/admin/node-builder') ? 'sidebar__nav-item--active' : ''}`}
                onClick={handleLinkClick}
              >
                Node Builder
              </Link>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;