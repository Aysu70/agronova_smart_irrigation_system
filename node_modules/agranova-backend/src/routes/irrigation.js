const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConfig,
  updateConfig,
  controlPump,
  getStats
} = require('../controllers/irrigationController');

router.get('/config', protect, getConfig);
router.put('/config', protect, updateConfig);
router.post('/pump', protect, controlPump);
router.get('/stats', protect, getStats);

module.exports = router;
