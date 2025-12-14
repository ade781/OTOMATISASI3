const express = require('express');
const { createUser, listUsers, getMe, deleteUser, resetPassword, updateRole } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getMe);

router.use(authMiddleware, requireAdmin);
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/password', resetPassword);
router.patch('/:id/role', updateRole);
router.delete('/:id', deleteUser);

module.exports = router;
