const express = require('express');
const router = express.Router();
const AuditService = require('../services/auditService');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * Audit and behavior logging routes
 * All routes require authentication and admin access for sensitive data
 */

// Middleware to check admin role
const adminOnlyMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ============ AUDIT LOG ROUTES ============

/**
 * GET /api/audit/changes/:collectionName/:documentId
 * Get audit trail for a specific document
 */
router.get('/changes/:collectionName/:documentId', protect, async (req, res) => {
  try {
    const { collectionName, documentId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await AuditService.getDocumentHistory(collectionName, documentId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/user-changes
 * Get all changes made by the current user
 */
router.get('/user-changes', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const changes = await AuditService.getUserChanges(req.user.id, limit);
    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/search
 * Search audit logs with filters
 */
router.get('/search', protect, adminOnlyMiddleware, async (req, res) => {
  try {
    const filters = {
      action: req.query.action,
      collectionName: req.query.collection,
      userId: req.query.userId,
      status: req.query.status,
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0
    };

    const results = await AuditService.searchAuditLogs(filters);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/summary
 * Get audit summary statistics
 */
router.get('/summary', protect, adminOnlyMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const summary = await AuditService.getAuditSummary(days);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/failed-changes
 * Get all failed changes
 */
router.get('/failed-changes', protect, adminOnlyMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const failed = await AuditService.getFailedChanges(limit);
    res.json({ success: true, data: failed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/version/:collectionName/:documentId/:versionIndex
 * Get a specific version of a document
 */
router.get('/version/:collectionName/:documentId/:versionIndex', protect, async (req, res) => {
  try {
    const { collectionName, documentId, versionIndex } = req.params;
    const version = await AuditService.getDocumentVersion(
      collectionName,
      documentId,
      parseInt(versionIndex)
    );

    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    res.json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ BEHAVIOR LOG ROUTES ============

/**
 * GET /api/audit/behaviors
 * Get behavior logs for the current user
 */
router.get('/behaviors', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const category = req.query.category;
    const behaviors = await AuditService.getUserBehaviors(req.user.id, category, limit);
    res.json({ success: true, data: behaviors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/behaviors/search
 * Search behavior logs with filters (admin only)
 */
router.get('/behaviors/search', protect, adminOnlyMiddleware, async (req, res) => {
  try {
    const filters = {
      action: req.query.action,
      category: req.query.category,
      userId: req.query.userId,
      result: req.query.result,
      severity: req.query.severity,
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0
    };

    const results = await AuditService.searchBehaviorLogs(filters);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/audit/behaviors/summary
 * Get behavior summary statistics
 */
router.get('/behaviors/summary', protect, adminOnlyMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const summary = await AuditService.getBehaviorSummary(days);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
