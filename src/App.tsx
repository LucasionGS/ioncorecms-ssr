import React, { JSX } from "react";
import { StaticRouter, BrowserRouter, Routes, Route, BrowserRouterProps, StaticRouterProviderProps } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout.tsx';
import { SocketProvider } from './contexts/SocketContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import AdminPage from './pages/AdminPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import MonitoringPage from './pages/MonitoringPage.tsx';
import ErrorLogsPage from './pages/ErrorLogsPage.tsx';
import DatabaseMigrationPage from './pages/DatabaseMigrationPage.tsx';
import NodeBuilderPage from './pages/NodeBuilderPage.tsx';
import NodeTypeManagerPage from './pages/NodeTypeManagerPage.tsx';
import './App.scss';
import NodeRenderer from './pages/NodeRenderer.tsx';
import StandardLayout from './layouts/StandardLayout.tsx';

function App() {
  let Router: (props: any) => JSX.Element;
  if (import.meta.env.SSR) {
    Router = (props: StaticRouterProviderProps) => <StaticRouter location="/" {...props} />;
  } else {
    Router = (props: BrowserRouterProps) => <BrowserRouter {...props} />;
  }
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router location="/">
          <Routes>
            {/* Public route for database migration - works without authentication */}
            <Route path="/migrate" element={<DatabaseMigrationPage />} />
            
            {/* Protected routes that require authentication */}
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <SocketProvider>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/monitoring" element={<MonitoringPage />} />
                      <Route path="/error-logs" element={<ErrorLogsPage />} />
                      <Route path="/node-builder" element={<NodeBuilderPage />} />
                      <Route path="/node-builder/:nodeType" element={<NodeTypeManagerPage />} />
                      <Route path="/node-builder/:nodeType/create" element={<NodeTypeManagerPage />} />
                      <Route path="/node-builder/:nodeType/edit/:nodeId" element={<NodeTypeManagerPage />} />
                    </Routes>
                  </AdminLayout>
                </SocketProvider>
              </ProtectedRoute>
            } />


            <Route path="/*" element={
              <SocketProvider>
                <StandardLayout>
                  <Routes>
                    <Route path="/*" Component={NodeRenderer} />
                  </Routes>
                </StandardLayout>
              </SocketProvider>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
