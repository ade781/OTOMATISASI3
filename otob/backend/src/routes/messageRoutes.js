const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { listConversations, getThread, sendMessage } = require('../controllers/messageController');

const router = express.Router();

router.use(authMiddleware);
router.get('/conversations', listConversations);
router.get('/thread/:peerId', getThread);
router.post('/', sendMessage);

module.exports = router;
