import React from 'react';
import Card from '../common/Card';
import { Sun } from 'lucide-react';

const SolarStatus = ({ status, angle, batteryLevel }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'ACTIVE': return 'text-green-600';
      case 'CHARGING': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = () => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100';
      case 'CHARGING': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <Card>
      <div className="text-center">
        <Sun className={`w-16 h-16 mx-auto mb-4 ${getStatusColor()}`} />
        <h3 className="text-lg font-semibold mb-2">Solar Panel</h3>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusBg()} ${getStatusColor()}`}>
          {status}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Angle:</span>
            <span className="font-medium">{angle}°</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Battery:</span>
            <span className="font-medium">{batteryLevel}%</span>
          </div>
        </div>
        {/* Battery indicator */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default SolarStatus;
