const { MonitoringState, BadanPublik } = require('../models');
const { ensureUserCanAccessBadanPublik } = require('../utils/access');

// Ambil semua monitoring milik user
const listMonitoring = async (req, res) => {
  try {
    const rows = await MonitoringState.findAll({
      where: { user_id: req.user.id },
      order: [['updated_at', 'DESC']]
    });
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil data monitoring' });
  }
};

// Update/insert monitoring untuk badan publik tertentu
const upsertMonitoring = async (req, res) => {
  try {
    const { badanPublikId } = req.params;
    const { start_date, extra_days } = req.body || {};
    const isAdmin = req.user.role === 'admin';

    const target = await BadanPublik.findByPk(badanPublikId);
    if (!target) {
      return res.status(404).json({ message: 'Badan publik tidak ditemukan' });
    }

    if (!isAdmin) {
      const canAccess = await ensureUserCanAccessBadanPublik(req.user, badanPublikId);
      if (!canAccess) {
        return res.status(403).json({ message: 'Akses ditolak: data tidak ditugaskan ke Anda.' });
      }
    }

    const payload = {
      user_id: req.user.id,
      badan_publik_id: badanPublikId,
      start_date: start_date || null,
      extra_days: Boolean(extra_days)
    };

    const existing = await MonitoringState.findOne({
      where: { user_id: req.user.id, badan_publik_id: badanPublikId }
    });

    if (existing) {
      await existing.update(payload);
      return res.json(existing);
    }

    const created = await MonitoringState.create(payload);
    return res.json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menyimpan monitoring' });
  }
};

module.exports = {
  listMonitoring,
  upsertMonitoring
};
