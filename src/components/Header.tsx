import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import './Header.scss';

interface HeaderProps {
  onMenuToggle?: () => void;
}

function Header({ onMenuToggle }: HeaderProps) {
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header__brand">
        <button 
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link to="/" className="header__logo">
          <span>IoncoreCMS</span>
        </Link>
      </div>
      
      {/* <nav className="header__nav">
        <Link to="/admin/" className={`header__nav-item ${location.pathname === '/admin/' ? 'header__nav-item--active' : ''}`}>
          Dashboard
        </Link>
        <Link to="/admin/users" className={`header__nav-item ${location.pathname === '/admin/users' ? 'header__nav-item--active' : ''}`}>
          Users
        </Link>
        <Link to="/admin/monitoring" className={`header__nav-item ${location.pathname === '/admin/monitoring' ? 'header__nav-item--active' : ''}`}>
          Monitoring
        </Link>
        <a href="#" className="header__nav-item">Settings</a>
      </nav> */}
      
      <div className="header__actions">
        {/* <button className="header__action-btn" title="Notifications">
          🔔
        </button>
        <button className="header__action-btn" title="Terminal">
          📟
        </button> */}
        <div className="header__user-menu">
          <span className="header__username" title={authState.user?.email}>
            {authState.user?.username}
          </span>
          <button 
            className="header__action-btn header__logout-btn" 
            title="Logout"
            onClick={handleLogout}
          >
            ⎋
          </button>
        </div>
        {/* <button className="header__action-btn" title="Refresh">
          🔄
        </button> */}
      </div>
    </header>
  );
}

export default Header;