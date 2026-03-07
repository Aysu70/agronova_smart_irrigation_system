const AuditLog = require('../models/AuditLog');
const BehaviorLog = require('../models/BehaviorLog');

/**
 * Service for logging all database changes and user behaviors
 */
class AuditService {
  /**
   * Log a database change (CREATE, UPDATE, DELETE)
   */
  static async logChange({
    action,
    collectionName,
    documentId,
    userId,
    userEmail,
    oldValues = null,
    newValues = null,
    changedFields = [],
    ipAddress = null,
    userAgent = null,
    reason = null,
    status = 'SUCCESS',
    errorMessage = null,
    metadata = {}
  }) {
    try {
      const auditLog = new AuditLog({
        action,
        collectionName,
        documentId,
        userId: userId || null,
        userEmail,
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent,
        reason,
        status,
        errorMessage,
        metadata
      });

      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Error logging change to AuditLog:', error);
      // Don't throw - logging should never break the main operation
    }
  }

  /**
   * Log a user behavior or system action
   */
  static async logBehavior({
    action,
    category,
    userId = null,
    userRole = null,
    relatedEntityType = null,
    relatedEntityId = null,
    description = '',
    result = 'SUCCESS',
    data = {},
    ipAddress = null,
    userAgent = null,
    endpoint = null,
    method = 'POST',
    executionTimeMs = 0,
    errorDetails = null,
    severity = 'MEDIUM'
  }) {
    try {
      const behaviorLog = new BehaviorLog({
        action,
        category,
        userId: userId || null,
        userRole,
        relatedEntityType,
        relatedEntityId,
        description,
        result,
        data,
        ipAddress,
        userAgent,
        endpoint,
        method,
        executionTimeMs,
        errorDetails,
        severity
      });

      await behaviorLog.save();
      return behaviorLog;
    } catch (error) {
      console.error('Error logging behavior to BehaviorLog:', error);
      // Don't throw - logging should never break the main operation
    }
  }

  /**
   * Get audit logs for a specific document
   */
  static async getDocumentHistory(collectionName, documentId, limit = 50) {
    return AuditLog.find({ collectionName, documentId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserChanges(userId, limit = 100) {
    return AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get behavior logs for a specific user
   */
  static async getUserBehaviors(userId, category = null, limit = 100) {
    const query = { userId };
    if (category) query.category = category;
    
    return BehaviorLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get all changes for a time period
   */
  static async getChangesByDateRange(startDate, endDate, collectionName = null) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    if (collectionName) {
      query.collectionName = collectionName;
    }

    return AuditLog.find(query)
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get all behaviors for a time period
   */
  static async getBehaviorsByDateRange(startDate, endDate, category = null) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    if (category) {
      query.category = category;
    }

    return BehaviorLog.find(query)
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get summary statistics
   */
  static async getAuditSummary(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalChanges,
      changesByAction,
      changesByCollection,
      changesByUser,
      failedChanges
    ] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: startDate } }),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$collectionName', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]),
      AuditLog.countDocuments({ 
        status: 'FAILED',
        createdAt: { $gte: startDate }
      })
    ]);

    return {
      period: `Last ${days} days`,
      totalChanges,
      changesByAction,
      changesByCollection,
      topUsers: changesByUser.slice(0, 10),
      failedChanges
    };
  }

  /**
   * Get behavior summary statistics
   */
  static async getBehaviorSummary(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalBehaviors,
      behaviorsByCategory,
      behaviorsByAction,
      failedBehaviors,
      criticalEvents
    ] = await Promise.all([
      BehaviorLog.countDocuments({ createdAt: { $gte: startDate } }),
      BehaviorLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      BehaviorLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      BehaviorLog.countDocuments({
        result: { $in: ['FAILED', 'CANCELLED'] },
        createdAt: { $gte: startDate }
      }),
      BehaviorLog.countDocuments({
        severity: 'CRITICAL',
        createdAt: { $gte: startDate }
      })
    ]);

    return {
      period: `Last ${days} days`,
      totalBehaviors,
      behaviorsByCategory,
      behaviorsByAction,
      failedBehaviors,
      criticalEvents
    };
  }

  /**
   * Restore previous version of a document (soft restore, doesn't actually modify data)
   * Returns the previous state for review
   */
  static async getDocumentVersion(collectionName, documentId, versionIndex = 0) {
    const changes = await AuditLog.find({
      collectionName,
      documentId,
      action: { $in: ['UPDATE', 'CREATE'] }
    })
    .sort({ createdAt: -1 })
    .limit(versionIndex + 1)
    .lean();

    if (changes.length > versionIndex) {
      return changes[versionIndex];
    }
    return null;
  }

  /**
   * Get all changes that failed
   */
  static async getFailedChanges(limit = 50) {
    return AuditLog.find({ status: 'FAILED' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Search audit logs with complex criteria
   */
  static async searchAuditLogs({
    action = null,
    collectionName = null,
    userId = null,
    status = null,
    startDate = null,
    endDate = null,
    limit = 50,
    skip = 0
  }) {
    const query = {};
    
    if (action) query.action = action;
    if (collectionName) query.collectionName = collectionName;
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    return AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Search behavior logs with complex criteria
   */
  static async searchBehaviorLogs({
    action = null,
    category = null,
    userId = null,
    result = null,
    severity = null,
    startDate = null,
    endDate = null,
    limit = 50,
    skip = 0
  }) {
    const query = {};
    
    if (action) query.action = action;
    if (category) query.category = category;
    if (userId) query.userId = userId;
    if (result) query.result = result;
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    return BehaviorLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

module.exports = AuditService;
