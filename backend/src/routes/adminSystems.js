const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const adminSystemController = require('../controllers/adminSystemController');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard statistics
router.get('/stats', adminSystemController.getDashboardStats);

// System management
router.get('/systems', adminSystemController.getAllSystems);
router.get('/system/:id', adminSystemController.getSystemById);
router.get('/logs/:systemId', adminSystemController.getSystemLogs);

// Alert management
router.get('/alerts', adminSystemController.getAdminAlerts);
router.patch('/alert/:id/read', adminSystemController.markAlertRead);
router.patch('/alert/:id/resolve', adminSystemController.resolveAlert);

module.exports = router;
