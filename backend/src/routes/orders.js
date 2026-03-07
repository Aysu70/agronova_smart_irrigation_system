const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User and Admin routes
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/', orderController.createOrder);
router.delete('/:id', orderController.cancelOrder);

// Admin only routes
router.put('/:id', adminOnly, orderController.updateOrderStatus);
router.get('/statistics/all', adminOnly, orderController.getOrderStatistics);

module.exports = router;
