const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');

// Get all alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50);
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark alert as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark all alerts as read
router.put('/read/all', protect, async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete alert
router.delete('/:id', protect, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Alert deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
