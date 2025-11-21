import { Router } from 'express';
import * as backendController from '../controllers/backendController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, backendController.getAllBackends);
router.get('/:id', authenticate, backendController.getBackendById);
router.post('/', authenticate, authorize('admin', 'editor'), backendController.createBackend);
router.delete('/:id', authenticate, authorize('admin'), backendController.deleteBackend);
router.put('/:backendId/servers/:serverId/status', authenticate, authorize('admin', 'editor'), backendController.updateServerStatus);

export default router;
