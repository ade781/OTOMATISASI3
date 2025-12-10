const express = require('express');
const {
  assignToUser,
  listAssignments,
  listAssignmentsByUser,
  listMyAssignments,
  listAssignmentHistory
} = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// User can view assignments self
router.get('/me', authMiddleware, listMyAssignments);

// Admin-only endpoints
router.use(authMiddleware, requireAdmin);
router.get('/history/all', listAssignmentHistory);
router.get('/', listAssignments);
router.get('/:userId', listAssignmentsByUser);
router.post('/', assignToUser);

module.exports = router;
