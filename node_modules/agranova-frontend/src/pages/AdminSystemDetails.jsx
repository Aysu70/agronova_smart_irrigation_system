import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminSystemAPI } from '../services/api';

const AdminSystemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [system, setSystem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchSystemData = async () => {
    try {
      const [systemResponse, logsResponse] = await Promise.all([
        adminSystemAPI.getSystemById(id),
        adminSystemAPI.getSystemLogs(id, 50)
      ]);

      if (systemResponse.data.success) {
        setSystem(systemResponse.data.system);
      }
      if (logsResponse.data.success) {
        setLogs(logsResponse.data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online':
        return 'bg-green-100 text-green-800';
      case 'Offline':
        return 'bg-gray-100 text-gray-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'INFO':
        return 'text-blue-600 bg-blue-50';
      case 'SYSTEM':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">System not found</p>
          <button
            onClick={() => navigate('/admin/systems')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Systems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/systems')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Systems
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{system.systemId}</h1>
            <p className="text-gray-600 mt-1">{system.ownerName} • {system.region}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(system.systemStatus)}`}>
            {system.systemStatus}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'overview'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'sensors'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sensor Data
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'logs'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'diagnostics'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Diagnostics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Soil Moisture</p>
              <p className="text-3xl font-bold text-gray-900">{system.soilMoisture}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${system.soilMoisture}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Temperature</p>
              <p className="text-3xl font-bold text-gray-900">{system.temperature}°C</p>
              <p className="text-sm text-gray-500 mt-2">Humidity: {system.humidity}%</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Water Tank</p>
              <p className="text-3xl font-bold text-gray-900">{system.waterTankLevel}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${system.waterTankLevel}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Battery Level</p>
              <p className="text-3xl font-bold text-gray-900">{system.batteryLevel}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    system.batteryLevel > 50 ? 'bg-green-500' : system.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${system.batteryLevel}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner</span>
                  <span className="font-medium text-gray-900">{system.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region</span>
                  <span className="font-medium text-gray-900">{system.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System Health</span>
                  <span className={`font-medium ${
                    system.systemHealth === 'Normal' ? 'text-green-600' :
                    system.systemHealth === 'Warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {system.systemHealth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Active</span>
                  <span className="font-medium text-gray-900">{formatDate(system.lastActive)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">
                    {system.location.latitude.toFixed(4)}, {system.location.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pump Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    system.pumpStatus === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {system.pumpStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Solar Status</span>
                  <span className="font-medium text-gray-900">{system.solarStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Status</span>
                  <span className={`font-medium ${
                    system.networkStatus === 'Connected' ? 'text-green-600' :
                    system.networkStatus === 'Poor' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {system.networkStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Firmware Version</span>
                  <span className="font-medium text-gray-900">{system.firmwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hardware Status</span>
                  <span className={`font-medium ${
                    system.hardwareStatus === 'OK' ? 'text-green-600' :
                    system.hardwareStatus === 'Warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {system.hardwareStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Sensor Readings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Soil Moisture</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-blue-900">{system.soilMoisture}%</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">Temperature</span>
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-orange-900">{system.temperature}°C</p>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-teal-900">Humidity</span>
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-teal-900">{system.humidity}%</p>
            </div>

            <div className="p-4 bg-cyan-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-cyan-900">Water Tank Level</span>
                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-cyan-900">{system.waterTankLevel}%</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Battery Level</span>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-green-900">{system.batteryLevel}%</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Pump Status</span>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-purple-900">{system.pumpStatus}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Logs (Last 50)</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time system activity and events</p>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No logs available</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={log._id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getLogTypeColor(log.logType)}`}>
                      {log.logType}
                    </span>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{log.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-4">{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Diagnostics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sensor Online</p>
                  <p className="text-sm text-gray-600">Sensor connectivity status</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  system.sensorOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {system.sensorOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Device Responding</p>
                  <p className="text-sm text-gray-600">Device communication status</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  system.deviceResponding ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {system.deviceResponding ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Network Status</p>
                  <p className="text-sm text-gray-600">Network connectivity</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  system.networkStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                  system.networkStatus === 'Poor' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {system.networkStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Hardware Status</p>
                  <p className="text-sm text-gray-600">Hardware health check</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  system.hardwareStatus === 'OK' ? 'bg-green-100 text-green-800' :
                  system.hardwareStatus === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {system.hardwareStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Firmware Version</p>
                  <p className="text-sm text-gray-600">Current firmware version</p>
                </div>
                <span className="text-gray-900 font-medium">{system.firmwareVersion}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Last Maintenance</p>
                  <p className="text-sm text-gray-600">Last maintenance date</p>
                </div>
                <span className="text-gray-900 font-medium">{formatDate(system.lastMaintenance)}</span>
              </div>
            </div>
          </div>

          {/* Admin Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Admin View Only</h4>
                <p className="text-sm text-blue-800">
                  As an admin, you can view system diagnostics and logs, but you cannot control pumps or change irrigation settings. 
                  Only the system owner can control their irrigation equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemDetails;
