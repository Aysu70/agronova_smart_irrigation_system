const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/packages', shopController.getPackages);
router.get('/packages/:id', shopController.getPackage);
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);
router.get('/featured', shopController.getFeaturedProducts);
router.get('/categories', shopController.getCategories);

// Protected routes (require authentication)
router.post('/recommend', protect, shopController.getRecommendation);
router.get('/recommendations', protect, shopController.getUserRecommendations);

module.exports = router;
