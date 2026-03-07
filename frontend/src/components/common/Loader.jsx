import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const loader = (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
