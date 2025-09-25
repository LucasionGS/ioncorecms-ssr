import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import './StandardLayout.scss';

interface StandardLayoutProps {
  children: ReactNode;
}

function StandardLayout({ children }: StandardLayoutProps) {
  const { authState, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="standard-layout">
      <header className="standard-layout__header">
        <div className="standard-layout__header-content">
          <Link to="/" className="standard-layout__brand">
            <span className="standard-layout__logo">IoncoreCMS</span>
          </Link>
          
          <nav className="standard-layout__nav">
            <Link to="/" className="standard-layout__nav-item">
              Home
            </Link>
            <Link to="/pages" className="standard-layout__nav-item">
              Pages
            </Link>
            
            {authState.isAuthenticated ? (
              <div className="standard-layout__user-menu">
                {authState.user?.isAdmin && (
                  <Link to="/admin" className="standard-layout__nav-item standard-layout__nav-item--admin">
                    Admin
                  </Link>
                )}
                <span className="standard-layout__username">
                  {authState.user?.username}
                </span>
                <button 
                  onClick={handleLogout}
                  className="standard-layout__logout-btn"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="standard-layout__auth-links">
                <Link to="/login" className="standard-layout__nav-item">
                  Login
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="standard-layout__content">
        {children}
      </main>
      
      <footer className="standard-layout__footer">
        <div className="standard-layout__footer-content">
          <p>&copy; 2025 IoncoreCMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default StandardLayout;