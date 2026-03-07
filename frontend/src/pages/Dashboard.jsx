import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import SensorCard from '../components/dashboard/SensorCard';
import PumpStatus from '../components/dashboard/PumpStatus';
import SolarStatus from '../components/dashboard/SolarStatus';
import WaterTankGauge from '../components/dashboard/WaterTankGauge';
import Loader from '../components/common/Loader';
import { Droplets, Thermometer, Cloud, Activity, Bluetooth, Wifi, Power, Radio, CheckCircle, XCircle, Loader as LoaderIcon } from 'lucide-react';
import { sensorAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import bluetoothService from '../services/bluetoothService';
import hardwareService from '../services/hardwareService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();
  
  // Hardware connection states
  const [connectionType, setConnectionType] = useState('wifi');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'scanning', 'connecting', 'connected', 'error'

  useEffect(() => {
    fetchLatestData();

    // Join user room for hardware updates
    if (socket && user?.id) {
      socket.emit('join', user.id);
      console.log('Joined user room for hardware updates');
    }

    // Listen for real-time updates from simulated sensors
    socket?.on('sensor_update', handleSensorUpdate);
    
    // Listen for real-time updates from hardware devices
    socket?.on('sensor:update', handleHardwareSensorUpdate);

    return () => {
      socket?.off('sensor_update', handleSensorUpdate);
      socket?.off('sensor:update', handleHardwareSensorUpdate);
    };
  }, [socket, user]);

  const handleSensorUpdate = (data) => {
    setSensorData(data);
  };
  
  const handleHardwareSensorUpdate = (data) => {
    console.log('Hardware sensor update received:', data);
    
    // Update sensor data with hardware values
    const newData = {
      soilMoisture: data.data?.soil,
      temperature: data.data?.temperature,
      humidity: data.data?.humidity,
      waterTankLevel: data.data?.tankLevel,
      pumpStatus: data.data?.pumpStatus,
      timestamp: data.timestamp,
      batteryLevel: sensorData?.batteryLevel || 75, // Keep existing battery level
      solarPanelStatus: sensorData?.solarPanelStatus || 'ACTIVE',
      solarPanelAngle: sensorData?.solarPanelAngle || 45
    };
    
    setSensorData(newData);
    setLastUpdate(new Date(data.timestamp));
    setConnectionStatus('connected');
    setDeviceConnected(true);
    
    toast.success(`Data updated from ${data.deviceName}`, { 
      icon: '📊',
      duration: 2000 
    });
  };

  const fetchLatestData = async () => {
    try {
      const response = await sensorAPI.getLatest();
      setSensorData(response.data.data);
    } catch (error) {
      toast.error('Failed to load sensor data');
    }
    setLoading(false);
  };
  
  // ============ BLUETOOTH CONNECTION ============
  const connectBluetooth = async () => {
    if (!bluetoothService.isSupported()) {
      toast.error('Web Bluetooth is not supported. Use Chrome, Edge, or Opera.');
      return;
    }

    setIsScanning(true);
    setConnectionStatus('scanning');
    
    // Show scanning toast
    const scanningToast = toast.loading('🔍 Scanning for Bluetooth devices...', {
      duration: 10000
    });

    try {
      // Small delay to show scanning state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsConnecting(true);
      setConnectionStatus('connecting');
      toast.dismiss(scanningToast);
      toast.loading('Please select your device from the list...', {
        duration: 5000,
        id: 'device-select'
      });
      
      const result = await bluetoothService.connect();
      
      toast.dismiss('device-select');
      setBluetoothConnected(true);
      setDeviceConnected(true);
      setDeviceName(result.deviceName);
      setConnectionStatus('connected');
      toast.success(`✅ Connected to ${result.deviceName}`);

      // Listen for incoming data
      bluetoothService.onData(async (message) => {
        if (message.type === 'data') {
          const data = message.data;
          
          // Update dashboard with real hardware data
          const newData = {
            soilMoisture: data.soil,
            temperature: data.temp,
            humidity: data.humidity,
            waterTankLevel: data.tank,
            pumpStatus: data.pump,
            timestamp: new Date(),
            batteryLevel: sensorData?.batteryLevel || 75,
            solarPanelStatus: sensorData?.solarPanelStatus || 'ACTIVE',
            solarPanelAngle: sensorData?.solarPanelAngle || 45
          };
          
          setSensorData(newData);
          setLastUpdate(new Date());
          
          // Register device on backend
          try {
            await hardwareService.registerDevice({
              deviceId: data.deviceId || result.deviceId,
              deviceName: result.deviceName,
              connectionType: 'bluetooth',
              metadata: { bluetoothAddress: result.deviceId }
            });
          } catch (error) {
            console.error('Error registering device:', error);
          }
        } else if (message.type === 'disconnected') {
          handleDisconnect();
        }
      });

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast.dismiss(scanningToast);
      toast.dismiss('device-select');
      
      if (error.message.includes('User cancelled')) {
        toast.error('Device selection cancelled');
        setConnectionStatus('disconnected');
      } else {
        toast.error(error.message || 'Failed to connect to Bluetooth device');
        setConnectionStatus('error');
      }
      
      setBluetoothConnected(false);
      setDeviceConnected(false);
    } finally {
      setIsScanning(false);
      setIsConnecting(false);
    }
  };

  const disconnectBluetooth = async () => {
    try {
      await bluetoothService.disconnect();
      handleDisconnect();
      toast.success('Bluetooth disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  const handleDisconnect = () => {
    setBluetoothConnected(false);
    setDeviceConnected(false);
    setConnectionStatus('disconnected');
    setDeviceName('');
  };
  
  // ============ WIFI CONNECTION ============
  const checkWifiDevices = async () => {
    try {
      const response = await hardwareService.getDevices();
      if (response.data && response.data.length > 0) {
        const onlineDevice = response.data.find(d => d.isOnline);
        if (onlineDevice) {
          setDeviceConnected(true);
          setDeviceName(onlineDevice.deviceName);
          setConnectionStatus('connected');
          setLastUpdate(new Date(onlineDevice.lastSeen));
        }
      }
    } catch (error) {
      console.error('Error checking WiFi devices:', error);
    }
  };
  
  // Check for WiFi devices on mount
  useEffect(() => {
    if (connectionType === 'wifi') {
      checkWifiDevices();
      const interval = setInterval(checkWifiDevices, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [connectionType]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Dashboard" />
        <div className="p-8 mt-16">
          
          {/* Hardware Connection Panel */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-800">Hardware Device Connection</h2>
              </div>
              
              {/* Connection Status Badge */}
              <div className="flex items-center gap-3">
                {connectionStatus === 'scanning' && (
                  <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
                    <LoaderIcon className="w-5 h-5 text-purple-600 animate-spin" />
                    <span className="text-sm font-semibold text-purple-700">Scanning...</span>
                  </div>
                )}
                {connectionStatus === 'connected' && (
                  <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Connected</span>
                  </div>
                )}
                {connectionStatus === 'connecting' && (
                  <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
                    <LoaderIcon className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-semibold text-blue-700">Connecting...</span>
                  </div>
                )}
                {connectionStatus === 'disconnected' && (
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Disconnected</span>
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Connection Error</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Connection Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setConnectionType('bluetooth')}
                  disabled={deviceConnected}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    connectionType === 'bluetooth'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Bluetooth className="w-4 h-4" />
                  Bluetooth (HC-05)
                </button>
                <button
                  onClick={() => setConnectionType('wifi')}
                  disabled={deviceConnected}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    connectionType === 'wifi'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Wifi className="w-4 h-4" />
                  WiFi (ESP32)
                </button>
              </div>
              
              {/* Connect/Disconnect Button */}
              {!deviceConnected ? (
                <button
                  onClick={connectionType === 'bluetooth' ? connectBluetooth : checkWifiDevices}
                  disabled={isConnecting || isScanning || (connectionType === 'wifi')}
                  className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : isConnecting ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Power className="w-5 h-5" />
                      {connectionType === 'bluetooth' ? 'Connect Bluetooth' : 'WiFi Auto-Connect'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={bluetoothConnected ? disconnectBluetooth : handleDisconnect}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  <Power className="w-5 h-5" />
                  Disconnect
                </button>
              )}
              
              {/* Device Info */}
              {deviceConnected && deviceName && (
                <div className="flex items-center gap-2 text-gray-700 ml-auto">
                  <span className="text-sm">
                    <strong>Device:</strong> {deviceName}
                  </span>
                  {lastUpdate && (
                    <span className="text-xs text-gray-500">
                      • Last update: {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* WiFi Info Message */}
            {connectionType === 'wifi' && !deviceConnected && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>WiFi Mode:</strong> ESP32 devices connect automatically. Make sure your ESP32 is powered on and configured with your server IP address.
                </p>
              </div>
            )}
            
            {/* Bluetooth Browser Warning */}
            {connectionType === 'bluetooth' && !bluetoothService.isSupported() && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Browser Not Supported:</strong> Web Bluetooth only works in Chrome, Edge, and Opera browsers.
                </p>
              </div>
            )}
          </div>
          
          {/* Sensor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SensorCard
              icon={Droplets}
              title="Soil Moisture"
              value={sensorData?.soilMoisture || 0}
              unit="%"
              type="moisture"
            />
            <SensorCard
              icon={Thermometer}
              title="Temperature"
              value={sensorData?.temperature || 0}
              unit="°C"
              type="temperature"
            />
            <SensorCard
              icon={Cloud}
              title="Humidity"
              value={sensorData?.humidity || 0}
              unit="%"
            />
            <SensorCard
              icon={Activity}
              title="Battery Level"
              value={sensorData?.batteryLevel || 0}
              unit="%"
            />
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WaterTankGauge level={sensorData?.waterTankLevel || 0} />
            <PumpStatus status={sensorData?.pumpStatus || 'OFF'} />
            <SolarStatus
              status={sensorData?.solarPanelStatus || 'INACTIVE'}
              angle={sensorData?.solarPanelAngle || 0}
              batteryLevel={sensorData?.batteryLevel || 0}
            />
          </div>

          {/* Info Card */}
          <div className={`mt-8 border rounded-xl p-6 ${
            deviceConnected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-primary-50 border-primary-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              deviceConnected ? 'text-green-900' : 'text-primary-900'
            }`}>
              {deviceConnected ? '🔌 Real Hardware Connected' : '🌱 System Status: Active'}
            </h3>
            <p className={deviceConnected ? 'text-green-700' : 'text-primary-700'}>
              {deviceConnected 
                ? `Receiving live data from ${deviceName}. All sensor readings are from real hardware.` 
                : 'All sensors are operational and transmitting data in real-time.'
              }
              {' '}Last updated: {sensorData ? new Date(sensorData.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
