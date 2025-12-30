import express from 'express';
import {
  sendBulkEmail,
  getEmailLogs,
  streamEmailLogs,
  retryEmail,
  deleteEmailLogsBulk
} from '../controllers/emailController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireCsrfForUnsafeMethods } from '../middleware/requireCsrf.js';

const router = express.Router();

router.use(verifyToken, requireCsrfForUnsafeMethods);

router.get('/logs', getEmailLogs);
router.get('/stream', streamEmailLogs);
router.post('/logs/bulk-delete', deleteEmailLogsBulk);
router.post('/send', sendBulkEmail);
router.post('/retry/:id', retryEmail);

export default router;
