import { Router } from 'express';
import * as dataController from '../controllers/dataController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Dashboard
router.get('/dashboard', authenticate, dataController.getDashboard);

// Monitoring
router.get('/stats', authenticate, dataController.getStats);
router.get('/health', authenticate, dataController.getSystemHealth);
router.get('/logs', authenticate, dataController.getLogs);

// ACLs
router.get('/acls', authenticate, dataController.getACLs);
router.post('/acls', authenticate, authorize('admin', 'editor'), dataController.createACL);
router.delete('/acls/:id', authenticate, authorize('admin'), dataController.deleteACL);

// Configuration
router.get('/config/history', authenticate, dataController.getConfigHistory);
router.get('/config/current', authenticate, dataController.getCurrentConfig);
router.post('/config/save', authenticate, authorize('admin', 'editor'), dataController.saveConfig);
router.post('/config/rollback/:id', authenticate, authorize('admin'), dataController.rollbackConfig);

// Alerts
router.get('/alerts', authenticate, dataController.getAlerts);
router.delete('/alerts/:id', authenticate, authorize('admin', 'editor'), dataController.deleteAlert);

// Certificates
router.get('/certificates', authenticate, dataController.getCertificates);

// High Availability
router.get('/ha-nodes', authenticate, dataController.getHANodes);

// Analytics
router.get('/analytics', authenticate, dataController.getAnalytics);

// Users
router.get('/users', authenticate, authorize('admin'), dataController.getUsers);
router.post('/users', authenticate, authorize('admin'), dataController.createUser);
router.delete('/users/:id', authenticate, authorize('admin'), dataController.deleteUser);

// Reports
router.get('/reports', authenticate, dataController.getReports);
router.post('/reports', authenticate, authorize('admin', 'editor'), dataController.generateReport);
router.delete('/reports/:id', authenticate, authorize('admin', 'editor'), dataController.deleteReport);

// Settings
router.get('/settings', authenticate, dataController.getSettings);
router.put('/settings', authenticate, authorize('admin'), dataController.updateSettings);

export default router;
