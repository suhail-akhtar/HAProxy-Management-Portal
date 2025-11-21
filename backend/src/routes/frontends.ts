import { Router } from 'express';
import * as frontendController from '../controllers/frontendController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, frontendController.getAllFrontends);
router.get('/:id', authenticate, frontendController.getFrontendById);
router.post('/', authenticate, authorize('admin', 'editor'), frontendController.createFrontend);
router.put('/:id', authenticate, authorize('admin', 'editor'), frontendController.updateFrontend);
router.delete('/:id', authenticate, authorize('admin'), frontendController.deleteFrontend);

export default router;
