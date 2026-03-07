const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', deviceController.getDevices);
router.get('/:id', deviceController.getDevice);

// Admin only routes
router.post('/', protect, adminOnly, deviceController.createDevice);
router.put('/:id', protect, adminOnly, deviceController.updateDevice);
router.delete('/:id', protect, adminOnly, deviceController.deleteDevice);

module.exports = router;
