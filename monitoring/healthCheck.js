// Advanced health monitoring
const mongoose = require('mongoose');

class HealthMonitor {
  static async getSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {},
      performance: {}
    };

    // Database health
    try {
      const dbState = mongoose.connection.readyState;
      health.services.database = {
        status: dbState === 1 ? 'connected' : 'disconnected',
        readyState: dbState,
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0
      };
    } catch (error) {
      health.services.database = { status: 'error', error: error.message };
      health.status = 'degraded';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.performance.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) + '%'
    };

    // CPU and uptime
    health.performance.uptime = process.uptime();
    health.performance.platform = process.platform;
    health.performance.nodeVersion = process.version;

    return health;
  }

  static async getDatabaseStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        documents: stats.objects,
        dataSize: Math.round(stats.dataSize / 1024 / 1024) + ' MB',
        storageSize: Math.round(stats.storageSize / 1024 / 1024) + ' MB',
        indexes: stats.indexes
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = HealthMonitor;