import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';

const Layout = ({ children, title, showBreadcrumb = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar title={title} onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16">
          {showBreadcrumb && <Breadcrumb />}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
