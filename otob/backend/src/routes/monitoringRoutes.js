const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { listMonitoring, upsertMonitoring } = require('../controllers/monitoringController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listMonitoring);
router.put('/:badanPublikId', upsertMonitoring);

module.exports = router;
