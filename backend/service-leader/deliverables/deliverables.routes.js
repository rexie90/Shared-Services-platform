import { Router } from 'express';
import { getAssignedRequests, getDeliverables, getDeliverableById, createDeliverable, resubmitDeliverable } from './deliverables.controller.js';
import { validateDeliverableCreation, validateResubmission } from './deliverables.validation.js';
import { protect } from '../../core/middleware/auth.middleware.js';
import { requireRole } from '../../core/middleware/rbac.middleware.js';

const router = Router();

router.use(protect, requireRole('SERVICE_LEADER'));

router.get('/assigned-requests', getAssignedRequests);
router.post('/', validateDeliverableCreation, createDeliverable);
router.get('/', getDeliverables);
router.get('/:id', getDeliverableById);
router.put('/:id/resubmit', validateResubmission, resubmitDeliverable);

export default router;