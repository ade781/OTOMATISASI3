const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, refresh, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Coba lagi nanti.' }
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

module.exports = router;
