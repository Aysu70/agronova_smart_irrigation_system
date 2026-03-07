import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import AutoMode from '../components/irrigation/AutoMode';
import ManualMode from '../components/irrigation/ManualMode';
import Card from '../components/common/Card';
import { irrigationAPI, sensorAPI } from '../services/api';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const IrrigationControl = () => {
  const [config, setConfig] = useState(null);
  const [currentMode, setCurrentMode] = useState('AUTOMATIC');
  const [pumpStatus, setPumpStatus] = useState('OFF');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchConfig();
    fetchStats();
    fetchPumpStatus();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await irrigationAPI.getConfig();
      setConfig(response.data.data);
      setCurrentMode(response.data.data.mode);
    } catch (error) {
      toast.error('Failed to load configuration');
    }
  };

  const fetchPumpStatus = async () => {
    try {
      const response = await sensorAPI.getLatest();
      setPumpStatus(response.data.data.pumpStatus);
    } catch (error) {
      console.error('Failed to fetch pump status');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await irrigationAPI.getStats('7d');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleModeToggle = async (mode) => {
    try {
      await irrigationAPI.updateConfig({ mode });
      setCurrentMode(mode);
      toast.success(`Switched to ${mode.toLowerCase()} mode`);
    } catch (error) {
      toast.error('Failed to switch mode');
    }
  };

  return (
    <Layout title="Irrigation Control">
      <div className="bg-gray-50">
        {/* Mode Selector */}
        <div className="mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => handleModeToggle('AUTOMATIC')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'AUTOMATIC'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Automatic Mode
            </button>
            <button
              onClick={() => handleModeToggle('MANUAL')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentMode === 'MANUAL'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Mode
            </button>
          </div>
        </div>

          {/* Mode Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {currentMode === 'AUTOMATIC' ? (
              <AutoMode config={config} onUpdate={fetchConfig} />
            ) : (
              <ManualMode pumpStatus={pumpStatus} onUpdate={fetchPumpStatus} />
            )}

            {/* Statistics */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold">Irrigation Statistics</h3>
              </div>
              
              {stats ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Irrigation Time (7 days)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalIrrigationTime} min</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pump Activations</p>
                      <p className="text-2xl font-bold text-primary-600">{stats.pumpActivations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Avg. Moisture</p>
                      <p className="text-2xl font-bold text-green-600">{stats.averageMoisture}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average Temperature</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.averageTemperature}°C</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      📊 Based on {stats.dataPoints} data points collected over the last 7 days
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading statistics...</p>
              )}
            </Card>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Tip</h4>
          <p className="text-yellow-800">
            <strong>Automatic Mode:</strong> System monitors soil moisture and activates irrigation when needed.
            <br />
            <strong>Manual Mode:</strong> You have full control over the pump with timer options.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default IrrigationControl;
