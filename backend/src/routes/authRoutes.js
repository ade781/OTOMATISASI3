import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { refreshToken } from '../controllers/refreshToken.js';
import { createUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import { requireTurnstile } from '../middleware/requireTurnstile.js';
import { csrf } from '../controllers/authController.js';
import {requireCsrfForUnsafeMethods} from '../middleware/requireCsrf.js';

const router = express.Router();

router.post('/login', requireTurnstile({bodyField: "turnstileToken"}), login);
router.get('/csrf', csrf);
router.post('/logout', requireCsrfForUnsafeMethods, logout);
router.post('/refresh', requireCsrfForUnsafeMethods,refreshToken);
router.post('/register', verifyToken, requireCsrfForUnsafeMethods,checkRole('admin'), createUser);

export default router;
