import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { refreshToken } from '../controllers/refreshToken.js';
import { createUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { requireTurnstile } from '../middleware/requireTurnstile.js';

const router = express.Router();

router.post('/login', requireTurnstile({bodyField: "turnstileToken"}), loginLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/register', verifyToken, checkRole('admin'), createUser);

export default router;
