import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  type = 'error' // error, warning, info
}) => {
  const icons = {
    error: <XCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    info: <AlertTriangle className="w-12 h-12 text-blue-500" />
  };

  const bgColors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  };

  return (
    <div className={`${bgColors[type]} border rounded-xl p-8 text-center`}>
      <div className="flex flex-col items-center space-y-4">
        {icons[type]}
        <div>
          <h3 className={`text-lg font-semibold ${textColors[type]}`}>{title}</h3>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 flex items-center space-x-2 px-6 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ 
  icon: Icon = AlertTriangle,
  title = 'No data available', 
  message = 'There is no data to display at the moment.',
  action,
  actionLabel = 'Refresh'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-md">{message}</p>
        </div>
        {action && (
          <button
            onClick={action}
            className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export { ErrorMessage, EmptyState };
export default ErrorMessage;
