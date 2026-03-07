import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Generate breadcrumb items from pathname
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Don't show breadcrumb on login/register pages
  if (['/login', '/register', '/'].includes(location.pathname)) {
    return null;
  }

  // Convert path segment to readable label
  const getLabel = (segment) => {
    // Handle specific cases
    const labels = {
      'dashboard': 'Dashboard',
      'irrigation': 'Irrigation Control',
      'analytics': 'Analytics',
      'community': 'Community',
      'ai-assistant': 'AI Assistant',
      'admin': 'Admin',
      'systems': 'Systems',
      'map': 'Map View',
      'alerts': 'Alerts',
      'users': 'Users',
    };

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        to="/" 
        className="flex items-center hover:text-green-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">
                {getLabel(segment)}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-green-600 transition-colors"
              >
                {getLabel(segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
