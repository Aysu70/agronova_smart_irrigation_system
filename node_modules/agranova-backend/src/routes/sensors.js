const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLatestData,
  getHistory,
  createSensorData
} = require('../controllers/sensorController');

router.get('/latest', protect, getLatestData);
router.get('/history', protect, getHistory);
router.post('/', createSensorData); // For IoT device (no auth for simplicity)

module.exports = router;
