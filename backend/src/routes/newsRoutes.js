import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { listKipNews } from '../controllers/newsController.js';
import { requireCsrfForUnsafeMethods } from '../middleware/requireCsrf.js';

const router = express.Router();

router.use(verifyToken, requireCsrfForUnsafeMethods);

router.get('/kip', listKipNews);

export default router;
