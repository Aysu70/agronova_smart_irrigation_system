import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Droplets,
  TrendingUp,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Sprout,
  Shield,
  Map,
  Monitor,
  AlertTriangle,
  Settings,
  X,
  ShoppingCart,
  CreditCard,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { prefetch } from "../../utils/prefetch";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // User menu items
  const userMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Irrigation", icon: Droplets, path: "/irrigation" },
    { name: "Analytics", icon: TrendingUp, path: "/analytics" },
    { name: "Shop Devices", icon: ShoppingCart, path: "/shop" },
    { name: "Community", icon: Users, path: "/community" },
    { name: "AI Assistant", icon: MessageSquare, path: "/ai-assistant" },
    { name: "Alerts", icon: Bell, path: "/alerts" },
  ];

  // Admin menu items
  const adminMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Payments", icon: CreditCard, path: "/admin/payments" },
    { name: "Devices", icon: Monitor, path: "/admin/devices" },
    { name: "System Monitor", icon: Activity, path: "/admin/monitor" },
  ];

  const menuItems = user?.role === "admin" ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AGRANOVA</h1>
                <p className="text-xs text-gray-500">
                  {user?.role === "admin"
                    ? "Admin Control"
                    : "Smart Agriculture"}
                </p>
              </div>
            </div>
            {/* Close button - only visible on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              onMouseEnter={() => prefetch(item.path)}
              onFocus={() => prefetch(item.path)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-green-50 text-green-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
