const ConnectedDevice = require('../models/ConnectedDevice');
const RealTimeSensorData = require('../models/RealTimeSensorData');

// @desc    Register a new device
// @route   POST /api/hardware/register
// @access  Private
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, deviceName, connectionType, metadata } = req.body;

    // Check if device already exists
    let device = await ConnectedDevice.findOne({ deviceId });

    if (device) {
      // Check if device belongs to another user
      if (device.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Device is already registered to another user'
        });
      }

      // Update existing device
      device.deviceName = deviceName || device.deviceName;
      device.connectionType = connectionType || device.connectionType;
      device.metadata = { ...device.metadata, ...metadata };
      device.status = 'online';
      device.lastSeen = new Date();
      device.isActive = true;

      await device.save();

      return res.status(200).json({
        success: true,
        message: 'Device reconnected successfully',
        data: device
      });
    }

    // Create new device
    device = await ConnectedDevice.create({
      deviceId,
      userId: req.user.id,
      deviceName,
      connectionType,
      metadata,
      status: 'online',
      lastSeen: new Date()
    });

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_REGISTERED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'ConnectedDevice',
        relatedEntityId: device._id,
        description: `Registered new ${connectionType} device: ${deviceName}`,
        data: { deviceId, connectionType },
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message
    });
  }
};

// @desc    Receive sensor data from hardware
// @route   POST /api/hardware/data
// @access  Public (with deviceId validation)
exports.receiveSensorData = async (req, res) => {
  try {
    const { deviceId, soil, temperature, humidity, tankLevel, pumpStatus } = req.body;

    // Validate device exists
    const device = await ConnectedDevice.findOne({ deviceId, isActive: true });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not active'
      });
    }

    // Update device status
    device.status = 'online';
    device.lastSeen = new Date();
    device.lastSensorData = {
      soil,
      temperature,
      humidity,
      tankLevel,
      pumpStatus
    };
    await device.save();

    // Store sensor data
    const sensorData = await RealTimeSensorData.create({
      deviceId,
      userId: device.userId,
      soil,
      temperature,
      humidity,
      tankLevel,
      pumpStatus,
      connectionType: device.connectionType,
      timestamp: new Date()
    });

    // Broadcast to user via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${device.userId}`).emit('sensor:update', {
        deviceId,
        deviceName: device.deviceName,
        data: {
          soil,
          temperature,
          humidity,
          tankLevel,
          pumpStatus
        },
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Data received successfully',
      data: sensorData
    });
  } catch (error) {
    console.error('Error receiving sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process sensor data',
      error: error.message
    });
  }
};

// @desc    Get user's devices
// @route   GET /api/hardware/devices
// @access  Private
exports.getUserDevices = async (req, res) => {
  try {
    const devices = await ConnectedDevice.find({
      userId: req.user.id,
      isActive: true
    }).sort({ lastSeen: -1 });

    // Update online/offline status based on lastSeen
    const devicesWithStatus = devices.map(device => {
      const deviceObj = device.toObject();
      deviceObj.isOnline = device.isOnline();
      return deviceObj;
    });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devicesWithStatus
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
};

// @desc    Get device by ID
// @route   GET /api/hardware/devices/:deviceId
// @access  Private
exports.getDevice = async (req, res) => {
  try {
    const device = await ConnectedDevice.findOne({
      deviceId: req.params.deviceId,
      userId: req.user.id,
      isActive: true
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const deviceObj = device.toObject();
    deviceObj.isOnline = device.isOnline();

    res.status(200).json({
      success: true,
      data: deviceObj
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device'
    });
  }
};

// @desc    Disconnect device
// @route   PUT /api/hardware/devices/:deviceId/disconnect
// @access  Private
exports.disconnectDevice = async (req, res) => {
  try {
    const device = await ConnectedDevice.findOne({
      deviceId: req.params.deviceId,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.status = 'offline';
    device.isActive = false;
    await device.save();

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_DISCONNECTED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'ConnectedDevice',
        relatedEntityId: device._id,
        description: `Disconnected device: ${device.deviceName}`,
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Device disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect device'
    });
  }
};

// @desc    Delete device
// @route   DELETE /api/hardware/devices/:deviceId
// @access  Private
exports.deleteDevice = async (req, res) => {
  try {
    const device = await ConnectedDevice.findOneAndDelete({
      deviceId: req.params.deviceId,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'DEVICE_DELETED',
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'ConnectedDevice',
        relatedEntityId: device._id,
        description: `Deleted device: ${device.deviceName}`,
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device'
    });
  }
};

// @desc    Get sensor history
// @route   GET /api/hardware/devices/:deviceId/history
// @access  Private
exports.getSensorHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100, hours = 24 } = req.query;

    // Verify device ownership
    const device = await ConnectedDevice.findOne({
      deviceId,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await RealTimeSensorData.find({
      deviceId,
      userId: req.user.id,
      timestamp: { $gte: startTime }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor history'
    });
  }
};

// @desc    Get latest sensor reading
// @route   GET /api/hardware/devices/:deviceId/latest
// @access  Private
exports.getLatestReading = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Verify device ownership
    const device = await ConnectedDevice.findOne({
      deviceId,
      userId: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const latestReading = await RealTimeSensorData.findOne({
      deviceId,
      userId: req.user.id
    }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: latestReading || device.lastSensorData
    });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest reading'
    });
  }
};

// @desc    Control pump (send command to device)
// @route   POST /api/hardware/devices/:deviceId/pump
// @access  Private
exports.controlPump = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command } = req.body; // 'ON' or 'OFF'

    // Verify device ownership
    const device = await ConnectedDevice.findOne({
      deviceId,
      userId: req.user.id,
      isActive: true
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or not active'
      });
    }

    if (!device.isOnline()) {
      return res.status(400).json({
        success: false,
        message: 'Device is offline'
      });
    }

    // Broadcast command to device via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`device:${deviceId}`).emit('pump:command', {
        command,
        timestamp: new Date()
      });
    }

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: `PUMP_${command}`,
        category: 'DEVICE_OPERATION',
        relatedEntityType: 'ConnectedDevice',
        relatedEntityId: device._id,
        description: `Sent pump ${command} command to ${device.deviceName}`,
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      message: `Pump ${command} command sent successfully`
    });
  } catch (error) {
    console.error('Error controlling pump:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control pump'
    });
  }
};
