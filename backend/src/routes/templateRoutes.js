import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  upsertTemplate,
  deleteTemplate,
} from '../controllers/templateController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', isAdmin, upsertTemplate);
router.put('/:id', isAdmin, upsertTemplate);
router.delete('/:id', isAdmin, deleteTemplate);

export default router;
