import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { adminAPI } from '../services/api';
import { 
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Users,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    offlineDevices: 0,
    maintenanceDevices: 0,
    totalUsers: 0,
    activeUsers: 0,
    systemUptime: '99.98%',
    serverLoad: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkStatus: 'Healthy',
    databaseStatus: 'Connected',
    apiResponseTime: 145
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemData();
    
    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchSystemData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Get users data
      const usersResponse = await adminAPI.getAllUsers();
      const users = usersResponse.data.data || [];
      
      // Simulate device statistics
      const totalDevices = users.length * 2; // Assume 2 devices per user
      const activeDevices = Math.floor(totalDevices * 0.75);
      const offlineDevices = Math.floor(totalDevices * 0.15);
      const maintenanceDevices = totalDevices - activeDevices - offlineDevices;
      
      // Simulate recent alerts
      const alerts = [
        {
          id: 1,
          type: 'warning',
          message: 'High memory usage detected on Server 2',
          timestamp: new Date(Date.now() - 300000),
          severity: 'medium'
        },
        {
          id: 2,
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 600000),
          severity: 'low'
        },
        {
          id: 3,
          type: 'error',
          message: '3 devices offline in Ganja-Gazakh region',
          timestamp: new Date(Date.now() - 900000),
          severity: 'high'
        },
        {
          id: 4,
          type: 'success',
          message: 'Database optimization completed',
          timestamp: new Date(Date.now() - 1200000),
          severity: 'low'
        },
        {
          id: 5,
          type: 'warning',
          message: 'API response time increased to 180ms',
          timestamp: new Date(Date.now() - 1500000),
          severity: 'medium'
        }
      ];
      
      // Simulate activity log
      const activities = [
        { action: 'User Registration', count: 12, timestamp: new Date(Date.now() - 180000) },
        { action: 'Device Connection', count: 45, timestamp: new Date(Date.now() - 240000) },
        { action: 'Data Backup', count: 1, timestamp: new Date(Date.now() - 600000) },
        { action: 'System Update', count: 1, timestamp: new Date(Date.now() - 900000) },
        { action: 'Alert Triggered', count: 8, timestamp: new Date(Date.now() - 1200000) }
      ];
      
      setSystemStats({
        totalDevices,
        activeDevices,
        offlineDevices,
        maintenanceDevices,
        totalUsers: users.length,
        activeUsers: Math.floor(users.length * 0.8),
        systemUptime: '99.98%',
        serverLoad: 40 + Math.floor(Math.random() * 20),
        memoryUsage: 55 + Math.floor(Math.random() * 15),
        diskUsage: 35 + Math.floor(Math.random() * 10),
        networkStatus: 'Healthy',
        databaseStatus: 'Connected',
        apiResponseTime: 130 + Math.floor(Math.random() * 30)
      });
      
      setRecentAlerts(alerts);
      setActivityLog(activities);
      
    } catch (error) {
      toast.error('Failed to load system data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPercentageColor = (value) => {
    if (value < 50) return 'text-green-600';
    if (value < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Layout title="System Monitor">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Monitor">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-green-600" />
              System Monitor
            </h1>
            <p className="text-gray-600 mt-2">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2 rounded"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={fetchSystemData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh Now
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Healthy
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">System Status</p>
            <p className="text-2xl font-bold text-gray-900">Operational</p>
            <p className="text-xs text-gray-500 mt-2">Uptime: {systemStats.systemUptime}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-bold text-green-600">{systemStats.activeDevices}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Devices</p>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalDevices}</p>
            <p className="text-xs text-red-600 mt-2">{systemStats.offlineDevices} offline</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-bold text-green-600">{systemStats.activeUsers}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% active rate
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                systemStats.apiResponseTime < 150 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {systemStats.apiResponseTime < 150 ? 'Fast' : 'Normal'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">API Response Time</p>
            <p className="text-2xl font-bold text-gray-900">{systemStats.apiResponseTime}ms</p>
            <p className="text-xs text-gray-500 mt-2">Average latency</p>
          </div>
        </div>

        {/* Server Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Server Load</p>
                  <p className={`text-2xl font-bold ${getPercentageColor(systemStats.serverLoad)}`}>
                    {systemStats.serverLoad}%
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(systemStats.serverLoad)}`}
                style={{ width: `${systemStats.serverLoad}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {systemStats.serverLoad < 50 ? 'Normal' : systemStats.serverLoad < 75 ? 'Moderate' : 'High'} load
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className={`text-2xl font-bold ${getPercentageColor(systemStats.memoryUsage)}`}>
                    {systemStats.memoryUsage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(systemStats.memoryUsage)}`}
                style={{ width: `${systemStats.memoryUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {systemStats.memoryUsage < 50 ? 'Normal' : systemStats.memoryUsage < 75 ? 'Moderate' : 'High'} usage
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <HardDrive className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                  <p className={`text-2xl font-bold ${getPercentageColor(systemStats.diskUsage)}`}>
                    {systemStats.diskUsage}%
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getProgressBarColor(systemStats.diskUsage)}`}
                style={{ width: `${systemStats.diskUsage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {systemStats.diskUsage < 50 ? 'Normal' : systemStats.diskUsage < 75 ? 'Moderate' : 'High'} usage
            </p>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-gray-700" />
            Service Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Network</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {systemStats.networkStatus}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Database className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {systemStats.databaseStatus}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">API Server</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Running
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-700" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent alerts</p>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.type)} flex items-start`}
                  >
                    <div className="mr-3 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-700" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activityLog.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                activityLog.map((activity, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {activity.count}x
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()} | Data refreshes automatically every 30 seconds
        </div>
      </div>
    </Layout>
  );
};

export default AdminMonitor;
