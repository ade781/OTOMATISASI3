const express = require('express');
const {
  listBadanPublik,
  getBadanPublik,
  createBadanPublik,
  updateBadanPublik,
  deleteBadanPublik,
  importBadanPublik
} = require('../controllers/badanPublikController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listBadanPublik);
router.get('/:id', getBadanPublik);
router.post('/', requireAdmin, createBadanPublik);
router.put('/:id', updateBadanPublik);
router.delete('/:id', requireAdmin, deleteBadanPublik);
router.post('/import', requireAdmin, importBadanPublik);

module.exports = router;
