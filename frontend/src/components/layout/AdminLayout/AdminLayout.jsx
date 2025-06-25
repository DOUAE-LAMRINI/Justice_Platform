import React, { useState } from 'react';
import './AdminLayout.css';
import Sidebar from './AdminSidebar';
import Header from './AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`admin-layout ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        darkMode={darkMode}
      />
      <div className="admin-main">
        <Header 
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;