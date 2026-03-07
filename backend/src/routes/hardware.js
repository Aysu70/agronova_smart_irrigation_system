const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerDevice,
  receiveSensorData,
  getUserDevices,
  getDevice,
  disconnectDevice,
  deleteDevice,
  getSensorHistory,
  getLatestReading,
  controlPump
} = require('../controllers/hardwareController');

// Public route - ESP32 sends data here
router.post('/data', receiveSensorData);

// Protected routes - require authentication
router.use(protect);

router.post('/register', registerDevice);
router.get('/devices', getUserDevices);
router.get('/devices/:deviceId', getDevice);
router.get('/devices/:deviceId/history', getSensorHistory);
router.get('/devices/:deviceId/latest', getLatestReading);
router.put('/devices/:deviceId/disconnect', disconnectDevice);
router.delete('/devices/:deviceId', deleteDevice);
router.post('/devices/:deviceId/pump', controlPump);

module.exports = router;
