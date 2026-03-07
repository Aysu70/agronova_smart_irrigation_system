const IrrigationSystem = require('../models/IrrigationSystem');
const AdminAlert = require('../models/AdminAlert');
const SystemLog = require('../models/SystemLog');
const User = require('../models/User');
const { isDatabaseConnected } = require('../config/database');

// Demo mode storage
const demoSystems = new Map();
const demoAlerts = [];
const demoLogs = new Map();

// Initialize demo data
const initializeDemoData = () => {
  if (demoSystems.size === 0) {
    // Create 10 demo irrigation systems
    const regions = ['North Valley', 'South Plains', 'East Hills', 'West Fields', 'Central Farm'];
    const statuses = ['Online', 'Online', 'Online', 'Warning', 'Offline'];
    
    for (let i = 1; i <= 10; i++) {
      const systemId = `SYS-${String(i).padStart(4, '0')}`;
      const status = statuses[i % statuses.length];
      
      demoSystems.set(systemId, {
        systemId,
        ownerId: `owner-${i}`,
        ownerName: `User ${i}`,
        region: regions[i % regions.length],
        location: {
          latitude: 40.7128 + (Math.random() - 0.5) * 2,
          longitude: -74.0060 + (Math.random() - 0.5) * 2
        },
        soilMoisture: Math.floor(Math.random() * 100),
        temperature: 20 + Math.floor(Math.random() * 15),
        humidity: 40 + Math.floor(Math.random() * 40),
        waterTankLevel: Math.floor(Math.random() * 100),
        pumpStatus: Math.random() > 0.5 ? 'ON' : 'OFF',
        batteryLevel: 60 + Math.floor(Math.random() * 40),
        solarStatus: 'ACTIVE',
        systemStatus: status,
        systemHealth: status === 'Offline' ? 'Critical' : status === 'Warning' ? 'Warning' : 'Normal',
        lastActive: status === 'Offline' ? new Date(Date.now() - 3600000) : new Date(),
        sensorOnline: status !== 'Offline',
        deviceResponding: status !== 'Offline',
        networkStatus: status === 'Warning' ? 'Poor' : 'Connected',
        firmwareVersion: '1.0.0',
        hardwareStatus: 'OK',
        installDate: new Date('2024-01-01'),
        lastMaintenance: new Date('2024-06-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      });

      // Create logs for each system
      if (!demoLogs.has(systemId)) {
        demoLogs.set(systemId, []);
      }
      
      for (let j = 0; j < 20; j++) {
        demoLogs.get(systemId).push({
          _id: `log-${systemId}-${j}`,
          systemId,
          logType: ['INFO', 'WARNING', 'ERROR', 'SYSTEM'][Math.floor(Math.random() * 4)],
          action: ['Sensor Reading', 'Pump Control', 'System Check', 'Network Ping'][Math.floor(Math.random() * 4)],
          message: `Demo log entry ${j} for ${systemId}`,
          data: { value: Math.random() * 100 },
          timestamp: new Date(Date.now() - j * 3600000)
        });
      }
    }

    // Create demo alerts
    demoAlerts.push(
      {
        _id: 'alert-1',
        systemId: 'SYS-0004',
        systemOwnerId: 'owner-4',
        ownerName: 'User 4',
        region: 'West Fields',
        alertType: 'NETWORK_FAILURE',
        severity: 'WARNING',
        message: 'Poor network connectivity detected',
        details: 'Signal strength below threshold',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 1800000)
      },
      {
        _id: 'alert-2',
        systemId: 'SYS-0005',
        systemOwnerId: 'owner-5',
        ownerName: 'User 5',
        region: 'Central Farm',
        alertType: 'SYSTEM_OFFLINE',
        severity: 'CRITICAL',
        message: 'System is offline',
        details: 'No response for 60 minutes',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 3600000)
      }
    );
  }
};

// Get all irrigation systems
exports.getAllSystems = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      initializeDemoData();
      
      const { region, status, health } = req.query;
      let systems = Array.from(demoSystems.values());

      // Apply filters
      if (region && region !== 'all') {
        systems = systems.filter(s => s.region === region);
      }
      if (status && status !== 'all') {
        systems = systems.filter(s => s.systemStatus === status);
      }
      if (health && health !== 'all') {
        systems = systems.filter(s => s.systemHealth === health);
      }

      return res.json({
        success: true,
        count: systems.length,
        systems
      });
    }

    // Database query
    let query = {};
    
    if (req.query.region && req.query.region !== 'all') {
      query.region = req.query.region;
    }
    if (req.query.status && req.query.status !== 'all') {
      query.systemStatus = req.query.status;
    }
    if (req.query.health && req.query.health !== 'all') {
      query.systemHealth = req.query.health;
    }

    const systems = await IrrigationSystem.find(query)
      .populate('ownerId', 'name email')
      .sort({ lastActive: -1 });

    res.json({
      success: true,
      count: systems.length,
      systems
    });
  } catch (error) {
    console.error('Get all systems error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch systems',
      error: error.message
    });
  }
};

// Get single system details
exports.getSystemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      initializeDemoData();
      const system = demoSystems.get(id);
      
      if (!system) {
        return res.status(404).json({
          success: false,
          message: 'System not found'
        });
      }

      return res.json({
        success: true,
        system
      });
    }

    const system = await IrrigationSystem.findOne({ systemId: id })
      .populate('ownerId', 'name email region');

    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'System not found'
      });
    }

    res.json({
      success: true,
      system
    });
  } catch (error) {
    console.error('Get system error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system',
      error: error.message
    });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res) => {
  try {
    const { systemId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!isDatabaseConnected()) {
      initializeDemoData();
      const logs = demoLogs.get(systemId) || [];
      
      return res.json({
        success: true,
        count: logs.length,
        logs: logs.slice(0, limit)
      });
    }

    const logs = await SystemLog.find({ systemId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
};

// Get admin alerts
exports.getAdminAlerts = async (req, res) => {
  try {
    const { unreadOnly, severity } = req.query;

    if (!isDatabaseConnected()) {
      initializeDemoData();
      let alerts = [...demoAlerts];

      if (unreadOnly === 'true') {
        alerts = alerts.filter(a => !a.isRead);
      }
      if (severity && severity !== 'all') {
        alerts = alerts.filter(a => a.severity === severity);
      }

      return res.json({
        success: true,
        count: alerts.length,
        alerts
      });
    }

    let query = { isResolved: false };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    const alerts = await AdminAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Mark alert as read
exports.markAlertRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const alert = demoAlerts.find(a => a._id === id);
      if (alert) {
        alert.isRead = true;
        return res.json({ success: true, alert });
      }
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const alert = await AdminAlert.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const alertIndex = demoAlerts.findIndex(a => a._id === id);
      if (alertIndex !== -1) {
        demoAlerts[alertIndex].isResolved = true;
        demoAlerts[alertIndex].resolvedAt = new Date();
        return res.json({ success: true, alert: demoAlerts[alertIndex] });
      }
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const alert = await AdminAlert.findByIdAndUpdate(
      id,
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user.id
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      initializeDemoData();
      const systems = Array.from(demoSystems.values());
      
      const stats = {
        totalSystems: systems.length,
        onlineSystems: systems.filter(s => s.systemStatus === 'Online').length,
        offlineSystems: systems.filter(s => s.systemStatus === 'Offline').length,
        systemsWithWarnings: systems.filter(s => s.systemStatus === 'Warning' || s.systemStatus === 'Critical').length,
        unreadAlerts: demoAlerts.filter(a => !a.isRead).length,
        criticalAlerts: demoAlerts.filter(a => a.severity === 'CRITICAL' && !a.isResolved).length,
        healthDistribution: {
          Normal: systems.filter(s => s.systemHealth === 'Normal').length,
          Warning: systems.filter(s => s.systemHealth === 'Warning').length,
          Critical: systems.filter(s => s.systemHealth === 'Critical').length
        }
      };

      return res.json({ success: true, stats });
    }

    const totalSystems = await IrrigationSystem.countDocuments();
    const onlineSystems = await IrrigationSystem.countDocuments({ systemStatus: 'Online' });
    const offlineSystems = await IrrigationSystem.countDocuments({ systemStatus: 'Offline' });
    const warningCritical = await IrrigationSystem.countDocuments({ 
      systemStatus: { $in: ['Warning', 'Critical'] } 
    });
    const unreadAlerts = await AdminAlert.countDocuments({ isRead: false });
    const criticalAlerts = await AdminAlert.countDocuments({ 
      severity: 'CRITICAL', 
      isResolved: false 
    });

    const healthDistribution = {
      Normal: await IrrigationSystem.countDocuments({ systemHealth: 'Normal' }),
      Warning: await IrrigationSystem.countDocuments({ systemHealth: 'Warning' }),
      Critical: await IrrigationSystem.countDocuments({ systemHealth: 'Critical' })
    };

    const stats = {
      totalSystems,
      onlineSystems,
      offlineSystems,
      systemsWithWarnings: warningCritical,
      unreadAlerts,
      criticalAlerts,
      healthDistribution
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Create system log (utility function for other controllers)
exports.createSystemLog = async (systemId, logType, action, message, data = {}) => {
  try {
    if (!isDatabaseConnected()) {
      if (!demoLogs.has(systemId)) {
        demoLogs.set(systemId, []);
      }
      demoLogs.get(systemId).unshift({
        _id: `log-${systemId}-${Date.now()}`,
        systemId,
        logType,
        action,
        message,
        data,
        timestamp: new Date()
      });
      // Keep only last 100 logs
      if (demoLogs.get(systemId).length > 100) {
        demoLogs.set(systemId, demoLogs.get(systemId).slice(0, 100));
      }
      return;
    }

    const log = new SystemLog({
      systemId,
      logType,
      action,
      message,
      data
    });

    await log.save();

    // Keep only last 1000 logs per system
    const count = await SystemLog.countDocuments({ systemId });
    if (count > 1000) {
      const oldLogs = await SystemLog.find({ systemId })
        .sort({ timestamp: -1 })
        .skip(1000);
      
      const oldIds = oldLogs.map(log => log._id);
      await SystemLog.deleteMany({ _id: { $in: oldIds } });
    }
  } catch (error) {
    console.error('Create log error:', error);
  }
};

module.exports = exports;
