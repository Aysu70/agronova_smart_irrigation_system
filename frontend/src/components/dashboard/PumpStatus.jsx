import React from 'react';
import Card from '../common/Card';
import { Power } from 'lucide-react';

const PumpStatus = ({ status, onToggle }) => {
  const isOn = status === 'ON';

  return (
    <Card>
      <div className="text-center">
        <Power className={`w-16 h-16 mx-auto mb-4 ${isOn ? 'text-green-600' : 'text-gray-400'}`} />
        <h3 className="text-lg font-semibold mb-2">Water Pump</h3>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {isOn ? '● Active' : '○ Inactive'}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          {isOn ? 'Irrigation in progress' : 'System ready'}
        </p>
      </div>
    </Card>
  );
};

export default PumpStatus;
