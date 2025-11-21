import { Router } from 'express';
import * as dataController from '../controllers/dataController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Dashboard
router.get('/dashboard', authenticate, apiLimiter, dataController.getDashboard);

// Monitoring
router.get('/stats', authenticate, apiLimiter, dataController.getStats);
router.get('/health', authenticate, apiLimiter, dataController.getSystemHealth);
router.get('/logs', authenticate, apiLimiter, dataController.getLogs);

// ACLs
router.get('/acls', authenticate, apiLimiter, dataController.getACLs);
router.post('/acls', authenticate, authorize('admin', 'editor'), apiLimiter, dataController.createACL);
router.delete('/acls/:id', authenticate, authorize('admin'), apiLimiter, dataController.deleteACL);

// Configuration
router.get('/config/history', authenticate, apiLimiter, dataController.getConfigHistory);
router.get('/config/current', authenticate, apiLimiter, dataController.getCurrentConfig);
router.post('/config/save', authenticate, authorize('admin', 'editor'), apiLimiter, dataController.saveConfig);
router.post('/config/rollback/:id', authenticate, authorize('admin'), apiLimiter, dataController.rollbackConfig);

// Alerts
router.get('/alerts', authenticate, apiLimiter, dataController.getAlerts);
router.delete('/alerts/:id', authenticate, authorize('admin', 'editor'), apiLimiter, dataController.deleteAlert);

// Certificates
router.get('/certificates', authenticate, apiLimiter, dataController.getCertificates);

// High Availability
router.get('/ha-nodes', authenticate, apiLimiter, dataController.getHANodes);

// Analytics
router.get('/analytics', authenticate, apiLimiter, dataController.getAnalytics);

// Users
router.get('/users', authenticate, authorize('admin'), apiLimiter, dataController.getUsers);
router.post('/users', authenticate, authorize('admin'), apiLimiter, dataController.createUser);
router.delete('/users/:id', authenticate, authorize('admin'), apiLimiter, dataController.deleteUser);

// Reports
router.get('/reports', authenticate, apiLimiter, dataController.getReports);
router.post('/reports', authenticate, authorize('admin', 'editor'), apiLimiter, dataController.generateReport);
router.delete('/reports/:id', authenticate, authorize('admin', 'editor'), apiLimiter, dataController.deleteReport);

// Settings
router.get('/settings', authenticate, apiLimiter, dataController.getSettings);
router.put('/settings', authenticate, authorize('admin'), apiLimiter, dataController.updateSettings);

export default router;
