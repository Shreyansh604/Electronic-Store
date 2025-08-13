import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Detailed health check with database status
router.get('/health/detailed', async (req, res) => {
    try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected', 
            2: 'connecting',
            3: 'disconnecting'
        };

        // Get database stats
        let dbStats = null;
        if (dbState === 1) {
            try {
                dbStats = await mongoose.connection.db.stats();
            } catch (error) {
                console.error('Error getting DB stats:', error);
            }
        }

        // Memory usage
        const memUsage = process.memoryUsage();

        const healthData = {
            success: true,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            database: {
                status: dbStatus[dbState],
                connected: dbState === 1,
                stats: dbStats ? {
                    collections: dbStats.collections,
                    dataSize: dbStats.dataSize,
                    storageSize: dbStats.storageSize,
                    indexes: dbStats.indexes
                } : null
            },
            memory: {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
            },
            cpu: {
                usage: process.cpuUsage()
            }
        };

        res.status(200).json(healthData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Ready check (for Kubernetes readiness probe)
router.get('/ready', async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not ready',
                ready: false
            });
        }

        // Perform a simple database operation
        await mongoose.connection.db.admin().ping();

        res.status(200).json({
            success: true,
            message: 'Service is ready',
            ready: true
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Service not ready',
            ready: false,
            error: error.message
        });
    }
});

// Live check (for Kubernetes liveness probe)
router.get('/live', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Service is alive',
        alive: true,
        timestamp: new Date().toISOString()
    });
});

export default router;
