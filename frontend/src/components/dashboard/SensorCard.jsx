import React from 'react';
import Card from '../common/Card';
import { getMoistureLevel, getTemperatureStatus } from '../../utils/helpers';

const SensorCard = ({ icon: Icon, title, value, unit, type }) => {
  let status = null;
  
  if (type === 'moisture') {
    status = getMoistureLevel(value);
  } else if (type === 'temperature') {
    status = getTemperatureStatus(value);
  }

  return (
    <Card hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <span className="text-lg text-gray-500">{unit}</span>
          </div>
          {status && (
            <p className={`text-sm mt-2 font-medium ${status.color}`}>
              {status.label}
            </p>
          )}
        </div>
        <div className="bg-primary-50 p-4 rounded-xl">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    </Card>
  );
};

export default SensorCard;
