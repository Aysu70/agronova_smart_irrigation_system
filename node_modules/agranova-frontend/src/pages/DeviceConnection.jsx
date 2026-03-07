import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bluetooth, Wifi, Power, AlertCircle, CheckCircle, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import bluetoothService from '../services/bluetoothService';
import hardwareService from '../services/hardwareService';
import { useSocket } from '../context/SocketContext';

const DeviceConnection = () => {
  const [connectionType, setConnectionType] = useState('bluetooth');
  const [isConnecting, setIsConnecting] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadDevices();
    
    // Listen for real-time sensor updates
    if (socket) {
      socket.on('sensor:update', handleSensorUpdate);
      
      return () => {
        socket.off('sensor:update', handleSensorUpdate);
      };
    }
  }, [socket]);

  const handleSensorUpdate = (data) => {
    console.log('Real-time sensor update:', data);
    setLatestData(data);
    toast.success(`Data updated from ${data.deviceName}`, { icon: '📊' });
  };

  const loadDevices = async () => {
    try {
      const response = await hardwareService.getDevices();
      setDevices(response.data);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  // ============ BLUETOOTH CONNECTION ============
  const connectBluetooth = async () => {
    if (!bluetoothService.isSupported()) {
      toast.error('Web Bluetooth is not supported in this browser. Use Chrome, Edge, or Opera.');
      return;
    }

    setIsConnecting(true);

    try {
      // Connect to Bluetooth device
      const result = await bluetoothService.connect();
      
      setBluetoothConnected(true);
      setBluetoothDevice(result);
      toast.success(`Connected to ${result.deviceName}`);

      // Set up data listener
      bluetoothService.onData(async (message) => {
        if (message.type === 'data') {
          console.log('Bluetooth data received:', message.data);
          setLatestData({
            deviceId: message.data.deviceId,
            deviceName: result.deviceName,
            data: {
              soil: message.data.soil,
              temperature: message.data.temp,
              humidity: message.data.humidity,
              tankLevel: message.data.tank,
              pumpStatus: message.data.pump
            },
            timestamp: new Date()
          });

          // Register device on backend
          try {
            await hardwareService.registerDevice({
              deviceId: message.data.deviceId || result.deviceId,
              deviceName: result.deviceName,
              connectionType: 'bluetooth',
              metadata: {
                bluetoothAddress: result.deviceId
              }
            });
          } catch (error) {
            console.error('Error registering device:', error);
          }
        } else if (message.type === 'disconnected') {
          setBluetoothConnected(false);
          setBluetoothDevice(null);
          toast.error('Bluetooth device disconnected');
        }
      });

      await loadDevices();

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast.error(error.message);
      setBluetoothConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectBluetooth = async () => {
    try {
      await bluetoothService.disconnect();
      setBluetoothConnected(false);
      setBluetoothDevice(null);
      toast.success('Bluetooth disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect');
    }
  };

  // ============ DEVICE CONTROL ============
  const controlPump = async (deviceId, command) => {
    try {
      if (bluetoothConnected && bluetoothDevice) {
        // Send via Bluetooth
        await bluetoothService.sendCommand(`PUMP_${command}`);
      } else {
        // Send via API (for WiFi devices)
        await hardwareService.controlPump(deviceId, command);
      }
      toast.success(`Pump turned ${command}`);
    } catch (error) {
      console.error('Error controlling pump:', error);
      toast.error('Failed to control pump');
    }
  };

  const deleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      await hardwareService.deleteDevice(deviceId);
      toast.success('Device deleted');
      await loadDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Radio className="w-10 h-10 text-green-600" />
            Hardware Device Connection
          </h1>
          <p className="text-gray-600">
            Connect your physical sensors via Bluetooth or WiFi
          </p>
        </motion.div>

        {/* Connection Type Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Select Connection Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bluetooth Option */}
            <button
              onClick={() => setConnectionType('bluetooth')}
              className={`p-6 rounded-xl border-2 transition-all ${
                connectionType === 'bluetooth'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <Bluetooth className={`w-12 h-12 mb-3 ${
                connectionType === 'bluetooth' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-lg mb-2">Bluetooth (HC-05)</h3>
              <p className="text-sm text-gray-600">
                Connect Arduino with HC-05 module via Web Bluetooth API
              </p>
            </button>

            {/* WiFi Option */}
            <button
              onClick={() => setConnectionType('wifi')}
              className={`p-6 rounded-xl border-2 transition-all ${
                connectionType === 'wifi'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Wifi className={`w-12 h-12 mb-3 ${
                connectionType === 'wifi' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold text-lg mb-2">WiFi (ESP32)</h3>
              <p className="text-sm text-gray-600">
                ESP32 automatically connects and sends data via WiFi
              </p>
            </button>
          </div>
        </motion.div>

        {/* Bluetooth Connection Panel */}
        {connectionType === 'bluetooth' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bluetooth className="w-6 h-6 text-blue-600" />
              Bluetooth Connection
            </h2>

            {!bluetoothService.isSupported() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Browser not supported</p>
                    <p className="text-sm text-yellow-700">
                      Web Bluetooth is only supported in Chrome, Edge, and Opera browsers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {!bluetoothConnected ? (
                <button
                  onClick={connectBluetooth}
                  disabled={isConnecting || !bluetoothService.isSupported()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="w-5 h-5" />
                      Connect to HC-05 Device
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Connected</p>
                          <p className="text-sm text-green-700">{bluetoothDevice?.deviceName}</p>
                        </div>
                      </div>
                      <button
                        onClick={disconnectBluetooth}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {latestData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Latest Data</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Soil Moisture</p>
                          <p className="text-2xl font-bold text-blue-600">{latestData.data?.soil}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Temperature</p>
                          <p className="text-2xl font-bold text-orange-600">{latestData.data?.temperature}°C</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Humidity</p>
                          <p className="text-2xl font-bold text-cyan-600">{latestData.data?.humidity}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Tank Level</p>
                          <p className="text-2xl font-bold text-purple-600">{latestData.data?.tankLevel}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Pump Status</p>
                          <p className={`text-2xl font-bold ${
                            latestData.data?.pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-400'
                          }`}>{latestData.data?.pumpStatus}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Make sure your HC-05 module is powered on and in pairing mode. Click "Connect" and select your HC-05 device from the list.
              </p>
            </div>
          </motion.div>
        )}

        {/* WiFi Connection Info */}
        {connectionType === 'wifi' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wifi className="w-6 h-6 text-green-600" />
              WiFi Connection (ESP32)
            </h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 mb-3">
                <strong>ESP32 devices automatically connect once configured.</strong>
              </p>
              <div className="text-sm text-green-700 space-y-2">
                <p>1. Upload the ESP32 code to your device</p>
                <p>2. Configure WiFi credentials in the code</p>
                <p>3. Set your server URL/IP address</p>
                <p>4. Power on the ESP32</p>
                <p>5. Device will appear below once connected</p>
              </div>
            </div>

            {latestData && latestData.connectionType === 'wifi' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Latest Data from WiFi Device</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Soil Moisture</p>
                    <p className="text-2xl font-bold text-blue-600">{latestData.data?.soil}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Temperature</p>
                    <p className="text-2xl font-bold text-orange-600">{latestData.data?.temperature}°C</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Humidity</p>
                    <p className="text-2xl font-bold text-cyan-600">{latestData.data?.humidity}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Tank Level</p>
                    <p className="text-2xl font-bold text-purple-600">{latestData.data?.tankLevel}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Pump Status</p>
                    <p className={`text-2xl font-bold ${
                      latestData.data?.pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-400'
                    }`}>{latestData.data?.pumpStatus}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Connected Devices List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connected Devices ({devices.length})
          </h2>

          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Radio className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <p>No devices connected yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.connectionType === 'bluetooth' ? (
                        <Bluetooth className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Wifi className="w-6 h-6 text-green-600" />
                      )}
                      <div>
                        <p className="font-semibold">{device.deviceName}</p>
                        <p className="text-sm text-gray-500">{device.deviceId}</p>
                        <p className="text-xs text-gray-400">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          device.isOnline
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {device.isOnline ? 'Online' : 'Offline'}
                      </span>
                      <button
                        onClick={() => controlPump(device.deviceId, 'ON')}
                        disabled={!device.isOnline}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Pump ON
                      </button>
                      <button
                        onClick={() => controlPump(device.deviceId, 'OFF')}
                        disabled={!device.isOnline}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Pump OFF
                      </button>
                      <button
                        onClick={() => deleteDevice(device.deviceId)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DeviceConnection;
