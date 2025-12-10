const express = require('express');
const {
  getMeQuota,
  setUserQuota,
  createQuotaRequest,
  listQuotaRequests,
  updateQuotaRequest,
  listMyQuotaRequests
} = require('../controllers/quotaController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/me', getMeQuota);
router.post('/request', createQuotaRequest);
router.get('/my-requests', listMyQuotaRequests);

router.use(requireAdmin);
router.get('/requests', listQuotaRequests);
router.patch('/requests/:id', updateQuotaRequest);
router.patch('/user/:userId', setUserQuota);

module.exports = router;
