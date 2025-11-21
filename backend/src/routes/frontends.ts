import { Router } from 'express';
import * as frontendController from '../controllers/frontendController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', authenticate, apiLimiter, frontendController.getAllFrontends);
router.get('/:id', authenticate, apiLimiter, frontendController.getFrontendById);
router.post('/', authenticate, authorize('admin', 'editor'), apiLimiter, frontendController.createFrontend);
router.put('/:id', authenticate, authorize('admin', 'editor'), apiLimiter, frontendController.updateFrontend);
router.delete('/:id', authenticate, authorize('admin'), apiLimiter, frontendController.deleteFrontend);

export default router;
