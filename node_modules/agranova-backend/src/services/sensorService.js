const SensorData = require('../models/SensorData');
const { isDatabaseConnected } = require('../config/database');

// Simulate IoT sensor data generation
class SensorService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.lastData = null; // Store last data for demo mode
  }

  // Start simulating sensor data
  startSimulation(io) {
    if (this.isRunning) {
      console.log('⚠️  Sensor simulation already running');
      return;
    }

    console.log('🚀 Starting sensor data simulation...');
    this.isRunning = true;

    // Generate data every 10 seconds
    this.interval = setInterval(async () => {
      try {
        const data = await this.generateSensorData();
        
        // Emit to all connected clients
        if (io) {
          io.emit('sensor_update', data);
        }
      } catch (error) {
        console.error('Error generating sensor data:', error.message);
      }
    }, 10000); // 10 seconds
  }

  // Stop simulation
  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Sensor simulation stopped');
    }
  }

  // Generate realistic sensor data
  async generateSensorData() {
    let previousData = this.lastData;
    
    // Try to get from database if connected
    if (isDatabaseConnected()) {
      try {
        previousData = await SensorData.findOne().sort({ timestamp: -1 });
      } catch (error) {
        // Use lastData if database query fails
      }
    }

    let soilMoisture, temperature, humidity, waterTankLevel, batteryLevel;

    if (previousData) {
      // Generate data with small variations from previous
      soilMoisture = this.addVariation(previousData.soilMoisture, 2, 0, 100);
      temperature = this.addVariation(previousData.temperature, 1, 15, 40);
      humidity = this.addVariation(previousData.humidity, 3, 20, 90);
      waterTankLevel = this.addVariation(previousData.waterTankLevel, 1, 0, 100);
      batteryLevel = this.addVariation(previousData.batteryLevel, 0.5, 0, 100);
    } else {
      // Initial values
      soilMoisture = this.randomBetween(40, 60);
      temperature = this.randomBetween(22, 28);
      humidity = this.randomBetween(50, 70);
      waterTankLevel = this.randomBetween(60, 90);
      batteryLevel = this.randomBetween(80, 100);
    }

    const dataObject = {
      soilMoisture: Math.round(soilMoisture * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      waterTankLevel: Math.round(waterTankLevel * 10) / 10,
      pumpStatus: previousData ? previousData.pumpStatus : 'OFF',
      solarPanelStatus: this.getSolarStatus(),
      solarPanelAngle: this.getSolarAngle(),
      batteryLevel: Math.round(batteryLevel * 10) / 10,
      timestamp: new Date()
    };

    // Save to database if connected, otherwise just use in memory
    let data;
    if (isDatabaseConnected()) {
      try {
        data = await SensorData.create(dataObject);
      } catch (error) {
        data = dataObject;
      }
    } else {
      data = dataObject;
    }

    // Store for next iteration
    this.lastData = data;
    return data;
  }

  // Helper: Add random variation
  addVariation(value, maxChange, min, max) {
    const change = (Math.random() - 0.5) * 2 * maxChange;
    let newValue = value + change;
    return Math.max(min, Math.min(max, newValue));
  }

  // Helper: Random between range
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Get solar panel status based on time
  getSolarStatus() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 18) {
      return Math.random() > 0.2 ? 'ACTIVE' : 'CHARGING';
    }
    return 'INACTIVE';
  }

  // Get solar panel angle based on time (sun tracking)
  getSolarAngle() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 18) {
      // Simulate sun tracking (0-180 degrees)
      return Math.round(((hour - 6) / 12) * 180);
    }
    return 0;
  }
}

module.exports = new SensorService();
