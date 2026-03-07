import React, { useState } from 'react';
import Card from '../common/Card';
import { Power, Clock, Play, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { irrigationAPI } from '../../services/api';

const ManualMode = ({ pumpStatus, onUpdate }) => {
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);

  const handlePumpControl = async (action) => {
    setLoading(true);
    try {
      await irrigationAPI.controlPump({
        action,
        duration: action === 'ON' ? duration : 0
      });
      toast.success(`Pump turned ${action}`);
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Failed to control pump');
    }
    setLoading(false);
  };

  const isPumpOn = pumpStatus === 'ON';

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <Power className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold">Manual Control</h3>
      </div>

      <div className="space-y-6">
        {/* Pump Status */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Current Status</p>
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
            isPumpOn 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {isPumpOn ? '● Pump Running' : '○ Pump Stopped'}
          </div>
        </div>

        {/* Timer */}
        {!isPumpOn && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Irrigation Duration (minutes)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xl font-bold text-primary-600 w-16 text-right">
                {duration}m
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePumpControl('ON')}
            disabled={loading || isPumpOn}
            className="flex items-center justify-center space-x-2 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span className="font-medium">Start</span>
          </button>
          <button
            onClick={() => handlePumpControl('OFF')}
            disabled={loading || !isPumpOn}
            className="flex items-center justify-center space-x-2 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StopCircle className="w-5 h-5" />
            <span className="font-medium">Stop</span>
          </button>
        </div>

        {isPumpOn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💧 Irrigation in progress. The pump will continue until manually stopped or water level is low.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ManualMode;
