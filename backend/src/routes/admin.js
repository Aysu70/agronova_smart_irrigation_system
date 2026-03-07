const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getUser,
  promoteToAdmin,
  demoteToUser,
  deleteUser
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect, adminOnly);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/promote', promoteToAdmin);
router.patch('/users/:id/demote', demoteToUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
