const express = require('express');
const { saveSmtpConfig, checkSmtpConfig, verifySmtpConfig, verifyImapConfig } = require('../controllers/smtpController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/smtp', authMiddleware, saveSmtpConfig);
router.post('/smtp/verify', authMiddleware, verifySmtpConfig);
router.post('/imap/verify', authMiddleware, verifyImapConfig);
router.get('/check', authMiddleware, checkSmtpConfig);

module.exports = router;
