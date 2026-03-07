const IrrigationConfig = require('../models/IrrigationConfig');
const SensorData = require('../models/SensorData');
const { getIO } = require('../config/socket');

// Get irrigation configuration
exports.getConfig = async (req, res) => {
  try {
    let config = await IrrigationConfig.findOne();
    
    if (!config) {
      config = await IrrigationConfig.create({});
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update irrigation configuration
exports.updateConfig = async (req, res) => {
  try {
    const { mode, moistureThreshold, manualTimer } = req.body;

    let config = await IrrigationConfig.findOne();
    
    if (!config) {
      config = await IrrigationConfig.create({});
    }

    if (mode) config.mode = mode;
    if (moistureThreshold !== undefined) config.moistureThreshold = moistureThreshold;
    if (manualTimer !== undefined) config.manualTimer = manualTimer;
    config.lastUpdated = Date.now();

    await config.save();

    // Log configuration update
    if (req.logBehavior) {
      req.logBehavior({
        action: 'IRRIGATION_CONFIG_UPDATED',
        category: 'IRRIGATION',
        relatedEntityType: 'IrrigationConfig',
        relatedEntityId: config._id,
        description: `Irrigation configuration updated`,
        data: { 
          mode: config.mode, 
          moistureThreshold: config.moistureThreshold,
          manualTimer: config.manualTimer
        },
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Emit real-time update
    const io = getIO();
    io.emit('irrigation_config_update', config);

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Manual pump control
exports.controlPump = async (req, res) => {
  try {
    const { action, duration } = req.body; // action: 'ON' or 'OFF'

    // Get latest sensor data
    let latestData = await SensorData.findOne().sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No sensor data available'
      });
    }

    // Create new sensor data with updated pump status
    const newData = await SensorData.create({
      soilMoisture: latestData.soilMoisture,
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      waterTankLevel: latestData.waterTankLevel,
      pumpStatus: action,
      solarPanelStatus: latestData.solarPanelStatus,
      solarPanelAngle: latestData.solarPanelAngle,
      batteryLevel: latestData.batteryLevel
    });

    // If duration specified, schedule auto-off
    if (action === 'ON' && duration) {
      setTimeout(async () => {
        const currentData = await SensorData.findOne().sort({ timestamp: -1 });
        await SensorData.create({
          ...currentData.toObject(),
          _id: undefined,
          pumpStatus: 'OFF',
          timestamp: Date.now()
        });
        
        const io = getIO();
        io.emit('pump_auto_off', { message: 'Pump turned off automatically' });
      }, duration * 60 * 1000); // Convert minutes to milliseconds
    }

    // Emit real-time update
    const io = getIO();
    io.emit('pump_status_update', {
      pumpStatus: action,
      timestamp: newData.timestamp
    });

    // Log pump control action
    if (req.logBehavior) {
      req.logBehavior({
        action: `PUMP_${action}`,
        category: 'IRRIGATION',
        description: `Pump ${action}${duration ? ` for ${duration} minutes` : ''}`,
        data: { action, duration },
        severity: 'MEDIUM'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      data: {
        pumpStatus: action,
        message: `Pump turned ${action}${duration ? ` for ${duration} minutes` : ''}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get irrigation statistics
exports.getStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    if (period === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const data = await SensorData.find({
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Calculate statistics
    let totalIrrigationTime = 0;
    let pumpOnCount = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i].pumpStatus === 'ON' && data[i-1].pumpStatus === 'OFF') {
        pumpOnCount++;
      }
      if (data[i].pumpStatus === 'ON') {
        const timeDiff = (new Date(data[i].timestamp) - new Date(data[i-1].timestamp)) / 1000 / 60; // minutes
        totalIrrigationTime += timeDiff;
      }
    }

    const avgMoisture = data.reduce((sum, d) => sum + d.soilMoisture, 0) / data.length;
    const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;

    res.status(200).json({
      success: true,
      data: {
        totalIrrigationTime: Math.round(totalIrrigationTime),
        pumpActivations: pumpOnCount,
        averageMoisture: Math.round(avgMoisture * 10) / 10,
        averageTemperature: Math.round(avgTemp * 10) / 10,
        dataPoints: data.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
