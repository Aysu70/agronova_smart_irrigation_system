const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { getIO } = require('../config/socket');

// Get latest sensor data
exports.getLatestData = async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No sensor data found'
      });
    }

    res.status(200).json({
      success: true,
      data: latestData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get sensor data history
exports.getHistory = async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
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

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create sensor data (simulated from IoT device)
exports.createSensorData = async (req, res) => {
  try {
    const sensorData = await SensorData.create(req.body);

    // Log sensor data creation with behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'SENSOR_DATA_RECORDED',
        category: 'SENSOR_DATA',
        relatedEntityType: 'SensorData',
        relatedEntityId: sensorData._id,
        description: `Sensor data recorded - Soil Moisture: ${sensorData.soilMoisture}%, Temp: ${sensorData.temperature}°C`,
        data: {
          soilMoisture: sensorData.soilMoisture,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          waterTankLevel: sensorData.waterTankLevel
        },
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Check for alerts
    await checkAndCreateAlerts(sensorData);

    // Emit real-time update
    const io = getIO();
    io.emit('sensor_update', sensorData);

    res.status(201).json({
      success: true,
      data: sensorData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check and create alerts based on sensor data
async function checkAndCreateAlerts(sensorData) {
  const io = getIO();

  // Low water alert
  if (sensorData.waterTankLevel < 20) {
    const alert = await Alert.create({
      type: 'LOW_WATER',
      severity: 'WARNING',
      message: `Water tank level is low: ${sensorData.waterTankLevel}%`
    });
    io.emit('new_alert', alert);
  }

  // Battery low alert
  if (sensorData.batteryLevel < 20) {
    const alert = await Alert.create({
      type: 'BATTERY_LOW',
      severity: 'WARNING',
      message: `Battery level is low: ${sensorData.batteryLevel}%`
    });
    io.emit('new_alert', alert);
  }

  // Pump status change alerts
  const previousData = await SensorData.findOne({ _id: { $ne: sensorData._id } })
    .sort({ timestamp: -1 });

  if (previousData && previousData.pumpStatus !== sensorData.pumpStatus) {
    const alertType = sensorData.pumpStatus === 'ON' ? 'IRRIGATION_START' : 'IRRIGATION_STOP';
    const alert = await Alert.create({
      type: alertType,
      severity: 'INFO',
      message: `Irrigation ${sensorData.pumpStatus === 'ON' ? 'started' : 'stopped'}`
    });
    io.emit('new_alert', alert);
  }
}
