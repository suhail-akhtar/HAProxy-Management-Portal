import { Router } from 'express';
import * as backendController from '../controllers/backendController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', authenticate, apiLimiter, backendController.getAllBackends);
router.get('/:id', authenticate, apiLimiter, backendController.getBackendById);
router.post('/', authenticate, authorize('admin', 'editor'), apiLimiter, backendController.createBackend);
router.delete('/:id', authenticate, authorize('admin'), apiLimiter, backendController.deleteBackend);
router.put('/:backendId/servers/:serverId/status', authenticate, authorize('admin', 'editor'), apiLimiter, backendController.updateServerStatus);

export default router;
