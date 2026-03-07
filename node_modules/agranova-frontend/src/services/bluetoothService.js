/**
 * Bluetooth Service for HC-05 Module Integration
 * Handles Web Bluetooth API communication with HC-05 Bluetooth modules
 */

class BluetoothService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.serialPort = null;
    this.serialReader = null;
    this.serialWriter = null;
    this.serialBuffer = '';
    this.transport = null; // 'ble' | 'serial'
    this.isConnected = false;
    this.dataCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    
    // Standard Serial Port Service UUID (HC-05 uses this)
    this.SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    this.CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
    
    // Alternative UUIDs for different HC-05 configurations
    this.ALTERNATIVE_SERVICE_UUID = '00001101-0000-1000-8000-00805f9b34fb'; // Serial Port Profile
  }

  /**
   * Check if Web Bluetooth or Web Serial is supported in the current browser
   */
  isSupported() {
    const hasBluetooth = !!navigator.bluetooth;
    const hasSerial = !!navigator.serial;

    if (!hasBluetooth && !hasSerial) {
      console.warn('Web Bluetooth and Web Serial APIs are not available in this browser');
      return false;
    }

    return true;
  }

  /**
   * Connect to HC-05 Bluetooth device
   * @returns {Promise<Object>} Connection result with device info
   */
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Bluetooth is not supported in this browser. Use Chrome or Edge on desktop.');
    }

    try {
      if (!navigator.bluetooth && navigator.serial) {
        return await this.connectSerial();
      }

      console.log('Requesting Bluetooth device...');
      
      // Request device - Accept all devices since HC-05 doesn't always advertise services properly
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          this.SERVICE_UUID, 
          this.ALTERNATIVE_SERVICE_UUID,
          '00001101-0000-1000-8000-00805f9b34fb', // SPP
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Common HC-05
          '0000ffe1-0000-1000-8000-00805f9b34fb'  // Common HC-05 characteristic
        ]
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      console.log('Device selected:', this.device.name);

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        this.handleDisconnection();
      });

      // Connect to GATT server
      console.log('Connecting to GATT server...');
      this.server = await this.device.gatt.connect();
      
      if (!this.server) {
        throw new Error('Failed to connect to GATT server');
      }

      console.log('GATT server connected');

      // Get the service - try multiple UUIDs
      let service;
      const serviceUUIDs = [
        this.SERVICE_UUID,
        this.ALTERNATIVE_SERVICE_UUID,
        '0000ffe0-0000-1000-8000-00805f9b34fb'
      ];
      
      for (const uuid of serviceUUIDs) {
        try {
          console.log(`Trying service UUID: ${uuid}`);
          service = await this.server.getPrimaryService(uuid);
          console.log('Service found:', service.uuid);
          break;
        } catch (error) {
          console.log(`Service ${uuid} not found, trying next...`);
        }
      }
      
      if (!service) {
        // List available services for debugging
        try {
          console.log('Listing all available services...');
          const services = await this.server.getPrimaryServices();
          console.log('Available services:', services.map(s => s.uuid));
          
          if (services.length > 0) {
            // Try the first available service
            service = services[0];
            console.log('Using first available service:', service.uuid);
          }
        } catch (e) {
          console.error('Could not list services:', e);
        }
        
        if (!service) {
          throw new Error('Could not find compatible Bluetooth service. Make sure HC-05 is properly configured.');
        }
      }

      // Get the characteristic - try multiple UUIDs
      const characteristicUUIDs = [
        this.CHARACTERISTIC_UUID,
        '0000ffe1-0000-1000-8000-00805f9b34fb'
      ];
      
      for (const uuid of characteristicUUIDs) {
        try {
          console.log(`Trying characteristic UUID: ${uuid}`);
          this.characteristic = await service.getCharacteristic(uuid);
          console.log('Characteristic found:', this.characteristic.uuid);
          break;
        } catch (error) {
          console.log(`Characteristic ${uuid} not found, trying next...`);
        }
      }
      
      if (!this.characteristic) {
        // List available characteristics for debugging
        try {
          console.log('Listing all available characteristics...');
          const characteristics = await service.getCharacteristics();
          console.log('Available characteristics:', characteristics.map(c => c.uuid));
          
          // Find a characteristic that supports notifications and write
          for (const char of characteristics) {
            if (char.properties.notify || char.properties.read) {
              this.characteristic = char;
              console.log('Using characteristic:', char.uuid);
              break;
            }
          }
        } catch (e) {
          console.error('Could not list characteristics:', e);
        }
        
        if (!this.characteristic) {
          throw new Error('Could not find compatible Bluetooth characteristic.');
        }
      }

      // Start notifications
      try {
        await this.characteristic.startNotifications();
        console.log('Notifications started');
      } catch (notifyError) {
        console.warn('Could not start notifications:', notifyError);
        // Continue anyway - we can still read/write
      }

      // Listen for data
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleDataReceived(event.target.value);
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.transport = 'ble';

      // Send initial handshake
      try {
        await this.sendCommand('HELLO');
      } catch (e) {
        console.warn('Could not send handshake:', e);
      }
      
      // Start polling for data as fallback (every 3 seconds)
      this.startPolling();

      return {
        success: true,
        deviceName: this.device.name || 'Bluetooth Device',
        deviceId: this.device.id,
        connected: true
      };

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      this.cleanup();

      if (navigator.serial) {
        console.warn('Falling back to Web Serial for HC-05...');
        return await this.connectSerial();
      }
      
      if (error.message.includes('User cancelled')) {
        throw new Error('Device selection cancelled by user');
      } else if (error.message.includes('not found')) {
        throw new Error('Device not compatible. Make sure HC-05 is properly configured.');
      } else {
        throw new Error(error.message || 'Failed to connect to Bluetooth device');
      }
    }
  }

  /**
   * Start polling for data (fallback if notifications don't work)
   */
  startPolling() {
    this.stopPolling(); // Clear any existing interval
    
    this.pollingInterval = setInterval(async () => {
      if (this.isConnected && this.characteristic) {
        try {
          // Try to read the characteristic value
          if (this.characteristic.properties.read) {
            const value = await this.characteristic.readValue();
            this.handleDataReceived(value);
          } else {
            // Request data via command
            await this.requestData();
          }
        } catch (error) {
          console.warn('Polling read error:', error);
        }
      }
    }, 3000); // Poll every 3 seconds
  }

  /**
   * Stop polling for data
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Connect using Web Serial (HC-05 classic Bluetooth via COM port)
   */
  async connectSerial() {
    if (!navigator.serial) {
      throw new Error('Web Serial is not supported in this browser. Use Chrome or Edge.');
    }

    try {
      console.log('Requesting serial port...');
      this.serialPort = await navigator.serial.requestPort();

      await this.serialPort.open({ baudRate: 9600 });
      this.serialWriter = this.serialPort.writable.getWriter();
      this.serialReader = this.serialPort.readable.getReader();
      this.transport = 'serial';
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.readSerialLoop();

      try {
        await this.sendCommand('HELLO');
      } catch (e) {
        console.warn('Could not send handshake over serial:', e);
      }

      return {
        success: true,
        deviceName: 'HC-05 (Serial)',
        deviceId: 'serial-port',
        connected: true
      };
    } catch (error) {
      this.cleanup();
      throw new Error(error.message || 'Failed to connect using Web Serial');
    }
  }

  async readSerialLoop() {
    if (!this.serialReader) {
      return;
    }

    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { value, done } = await this.serialReader.read();
        if (done) {
          break;
        }

        if (value) {
          this.serialBuffer += decoder.decode(value);

          let newlineIndex = this.serialBuffer.indexOf('\n');
          while (newlineIndex !== -1) {
            const line = this.serialBuffer.slice(0, newlineIndex).trim();
            this.serialBuffer = this.serialBuffer.slice(newlineIndex + 1);

            if (line) {
              this.handleTextMessage(line);
            }

            newlineIndex = this.serialBuffer.indexOf('\n');
          }
        }
      }
    } catch (error) {
      console.error('Serial read error:', error);
      this.handleDisconnection();
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect() {
    try {
      this.stopPolling();

      if (this.serialReader) {
        await this.serialReader.cancel();
        this.serialReader.releaseLock();
        this.serialReader = null;
      }

      if (this.serialWriter) {
        await this.serialWriter.close();
        this.serialWriter.releaseLock();
        this.serialWriter = null;
      }

      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
      
      if (this.characteristic) {
        try {
          await this.characteristic.stopNotifications();
        } catch (e) {
          console.warn('Error stopping notifications:', e);
        }
      }
      
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
      }
      
      this.cleanup();
      console.log('Bluetooth disconnected successfully');
    } catch (error) {
      console.error('Error during disconnect:', error);
      this.cleanup();
    }
  }

  /**
   * Handle incoming data from HC-05
   */
  handleDataReceived(value) {
    try {
      const decoder = new TextDecoder('utf-8');
      const message = decoder.decode(value);
      console.log('Raw data received:', message);
      this.handleTextMessage(message);
    } catch (error) {
      console.error('Error handling received data:', error);
    }
  }

  handleTextMessage(message) {
    // Parse the data (expecting JSON format from Arduino)
    // Example format: {"soil":45,"temp":25.5,"humidity":60,"tank":75,"pump":"OFF"}
    try {
      const data = JSON.parse(message);

      if (this.dataCallback) {
        this.dataCallback({
          type: 'data',
          data: data,
          timestamp: new Date(),
          raw: message
        });
      }
    } catch (parseError) {
      // If not JSON, handle as plain text
      console.log('Non-JSON data received:', message);

      // Try to parse simple format: SOIL:45,TEMP:25.5,HUM:60,TANK:75,PUMP:OFF
      const parsedData = this.parseSimpleFormat(message);

      if (parsedData && this.dataCallback) {
        this.dataCallback({
          type: 'data',
          data: parsedData,
          timestamp: new Date(),
          raw: message
        });
      }
    }
  }

  /**
   * Parse simple key:value format data
   */
  parseSimpleFormat(message) {
    try {
      const parts = message.trim().split(',');
      const data = {};
      
      parts.forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) {
          const cleanKey = key.trim().toLowerCase();
          const cleanValue = value.trim();
          
          // Map keys to expected format
          if (cleanKey.includes('soil')) {
            data.soil = parseFloat(cleanValue);
          } else if (cleanKey.includes('temp')) {
            data.temp = parseFloat(cleanValue);
          } else if (cleanKey.includes('hum')) {
            data.humidity = parseFloat(cleanValue);
          } else if (cleanKey.includes('tank')) {
            data.tank = parseFloat(cleanValue);
          } else if (cleanKey.includes('pump')) {
            data.pump = cleanValue.toUpperCase();
          }
        }
      });
      
      return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
      console.error('Error parsing simple format:', error);
      return null;
    }
  }

  /**
   * Register callback for incoming data
   */
  onData(callback) {
    this.dataCallback = callback;
  }

  /**
   * Send command to HC-05 device
   */
  async sendCommand(command) {
    if (!this.isConnected || (!this.characteristic && this.transport !== 'serial')) {
      throw new Error('Not connected to any device');
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');

      if (this.transport === 'serial' && this.serialWriter) {
        await this.serialWriter.write(data);
        console.log('Command sent over serial:', command);
        return true;
      }

      // Check if characteristic supports write
      if (this.characteristic && (this.characteristic.properties.write || this.characteristic.properties.writeWithoutResponse)) {
        await this.characteristic.writeValue(data);
        console.log('Command sent:', command);
        return true;
      }

      console.warn('No writable characteristic found');
      return false;
    } catch (error) {
      console.error('Error sending command:', error);
      // Don't throw - just log and return false
      return false;
    }
  }

  /**
   * Control pump (send command to Arduino)
   */
  async controlPump(action) {
    const command = action === 'ON' ? 'PUMP_ON' : 'PUMP_OFF';
    return await this.sendCommand(command);
  }

  /**
   * Request fresh data from device
   */
  async requestData() {
    return await this.sendCommand('GET_DATA');
  }

  /**
   * Handle disconnection event
   */
  handleDisconnection() {
    const wasConnected = this.isConnected;
    this.cleanup();

    if (wasConnected && this.dataCallback) {
      this.dataCallback({
        type: 'disconnected',
        message: 'Device disconnected',
        timestamp: new Date()
      });
    }

    // Auto-reconnect logic
    if (this.reconnectAttempts < this.maxReconnectAttempts && wasConnected) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.reconnect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  /**
   * Attempt to reconnect to the last device
   */
  async reconnect() {
    if (!this.device) {
      console.log('No device to reconnect to');
      return;
    }

    try {
      console.log('Reconnecting to', this.device.name);
      this.server = await this.device.gatt.connect();
      
      // Use same robust service discovery as connect()
      let service;
      const serviceUUIDs = [
        this.SERVICE_UUID,
        this.ALTERNATIVE_SERVICE_UUID,
        '0000ffe0-0000-1000-8000-00805f9b34fb'
      ];
      
      for (const uuid of serviceUUIDs) {
        try {
          service = await this.server.getPrimaryService(uuid);
          console.log('Service found on reconnect:', service.uuid);
          break;
        } catch (error) {
          console.log(`Service ${uuid} not found on reconnect, trying next...`);
        }
      }
      
      if (!service) {
        const services = await this.server.getPrimaryServices();
        if (services.length > 0) {
          service = services[0];
        }
      }
      
      if (!service) {
        throw new Error('No service available');
      }
      
      // Get characteristic
      const characteristicUUIDs = [
        this.CHARACTERISTIC_UUID,
        '0000ffe1-0000-1000-8000-00805f9b34fb'
      ];
      
      for (const uuid of characteristicUUIDs) {
        try {
          this.characteristic = await service.getCharacteristic(uuid);
          console.log('Characteristic found on reconnect:', this.characteristic.uuid);
          break;
        } catch (error) {
          console.log(`Characteristic ${uuid} not found on reconnect, trying next...`);
        }
      }
      
      if (!this.characteristic) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.notify || char.properties.read) {
            this.characteristic = char;
            break;
          }
        }
      }
      
      if (!this.characteristic) {
        throw new Error('No characteristic available');
      }
      
      try {
        await this.characteristic.startNotifications();
      } catch (e) {
        console.warn('Could not start notifications on reconnect:', e);
      }
      
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleDataReceived(event.target.value);
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Restart polling
      this.startPolling();
      
      console.log('Reconnected successfully');
      
      if (this.dataCallback) {
        this.dataCallback({
          type: 'reconnected',
          message: 'Device reconnected',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnect();
        }, 2000 * (this.reconnectAttempts + 1));
      }
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopPolling();
    this.isConnected = false;
    this.server = null;
    this.characteristic = null;
    this.serialPort = null;
    this.serialReader = null;
    this.serialWriter = null;
    this.serialBuffer = '';
    this.transport = null;
    // Keep device reference for potential reconnection
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      deviceName: this.device?.name || (this.transport === 'serial' ? 'HC-05 (Serial)' : null),
      deviceId: this.device?.id || (this.transport === 'serial' ? 'serial-port' : null),
      transport: this.transport
    };
  }

  /**
   * Check if currently connected
   */
  isDeviceConnected() {
    if (this.transport === 'serial') {
      return this.isConnected && !!this.serialPort;
    }

    return this.isConnected && this.device && this.device.gatt.connected;
  }
}

// Export singleton instance
const bluetoothService = new BluetoothService();
export default bluetoothService;
