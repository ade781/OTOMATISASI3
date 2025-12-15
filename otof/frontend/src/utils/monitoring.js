import api from '../services/api';

// Ambil monitoring map dari server (per user)
export const fetchMonitoringMap = async () => {
  const res = await api.get('/monitoring');
  const list = res.data || [];
  const map = {};
  list.forEach((row) => {
    if (!row?.badan_publik_id) return;
    map[row.badan_publik_id] = {
      startDate: row.start_date || null,
      extraDays: Boolean(row.extra_days),
      updatedAt: row.updated_at || null
    };
  });
  return map;
};

// Update/start monitoring untuk badan publik tertentu
export const saveMonitoringEntry = async (badanPublikId, { startDate, extraDays }) => {
  const payload = {
    start_date: startDate || null,
    extra_days: Boolean(extraDays)
  };
  const res = await api.put(`/monitoring/${badanPublikId}`, payload);
  const row = res.data || {};
  return {
    badan_publik_id: badanPublikId,
    startDate: row.start_date || payload.start_date || null,
    extraDays: row.extra_days ?? payload.extra_days ?? false,
    updatedAt: row.updated_at || new Date().toISOString()
  };
};
