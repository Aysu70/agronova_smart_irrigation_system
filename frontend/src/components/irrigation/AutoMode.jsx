import React, { useState } from 'react';
import Card from '../common/Card';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { irrigationAPI } from '../../services/api';

const AutoMode = ({ config, onUpdate }) => {
  const [threshold, setThreshold] = useState(config?.moistureThreshold || 30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await irrigationAPI.updateConfig({
        mode: 'AUTOMATIC',
        moistureThreshold: threshold
      });
      toast.success('Auto mode configured!');
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Failed to update configuration');
    }
    setSaving(false);
  };

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold">Automatic Mode</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soil Moisture Threshold
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="10"
              max="80"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold text-primary-600 w-16 text-right">
              {threshold}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Irrigation will start automatically when soil moisture drops below this level
          </p>
        </div>

        {/* Visual indicator */}
        <div className="bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 h-8 rounded-lg relative">
          <div
            className="absolute top-0 w-1 h-8 bg-primary-600"
            style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Trigger Point
            </div>
          </div>
        </div>

        <div className="flex space-x-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span>Dry</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Moist</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </Card>
  );
};

export default AutoMode;
