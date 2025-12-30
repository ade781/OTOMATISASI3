import express from 'express';
import {assignToUser, listAssignments, listAssignmentsByUser, listMyAssignments} from '../controllers/assignmentController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import { requireCsrfForUnsafeMethods } from '../middleware/requireCsrf.js';

const router = express.Router();

router.use(verifyToken, requireCsrfForUnsafeMethods);

// User endpoints
router.get('/me', listMyAssignments);

// Admin endpoints
router.get('/', checkRole('admin'), listAssignments);
router.get('/:userId', checkRole('admin'), listAssignmentsByUser);
router.post('/', checkRole('admin'), assignToUser);

export default router;
