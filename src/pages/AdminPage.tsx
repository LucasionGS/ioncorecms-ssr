import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="page-content">
      <h1>Welcome to IoncoreCMS</h1>
      <p>Content management system administration dashboard. Manage users, monitor system performance, and handle administrative tasks.</p>
      
      <div className="placeholder-content">
        <h2>Available Features:</h2>
        <ul>
          <li>User Management</li>
          <li>System Monitoring</li>
          <li>Error Logging</li>
          <li>Database Administration</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;