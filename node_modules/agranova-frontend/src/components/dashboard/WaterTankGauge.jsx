import React from 'react';
import Card from '../common/Card';

const WaterTankGauge = ({ level }) => {
  const getColor = () => {
    if (level < 20) return 'bg-red-500';
    if (level < 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (level < 20) return 'text-red-600';
    if (level < 50) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Water Tank Level</h3>
      
      {/* Circular gauge */}
      <div className="relative w-48 h-48 mx-auto">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - level / 100)}`}
            className={getColor()}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${getTextColor()}`}>{level}%</div>
          <div className="text-sm text-gray-500 mt-1">
            {level < 20 ? 'Low' : level < 50 ? 'Medium' : 'Good'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Empty (0%)</span>
        <span>Full (100%)</span>
      </div>
    </Card>
  );
};

export default WaterTankGauge;
