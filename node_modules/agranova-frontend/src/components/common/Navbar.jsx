import React, { useState, useEffect } from 'react';
import { Bell, User, Wifi, WifiOff, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { alertAPI } from '../../services/api';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const Navbar = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadAlerts();
  }, []);

  const fetchUnreadAlerts = async () => {
    try {
      const response = await alertAPI.getAll();
      const unread = response.data.data.filter(alert => !alert.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left Section - Title & Menu Button */}
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu - Only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        {/* Connection Status - Hide on small screens */}
        <div className="hidden sm:flex items-center space-x-2">
          {connected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Online</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">Offline</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile - Hide name on small screens */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
