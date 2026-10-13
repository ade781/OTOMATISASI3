const MONITORING_KEY = 'monitoringMap';

export const getMonitoringMap = (badanList = []) => {
  const map = {};

  // Hydrate from backend database fields first
  if (Array.isArray(badanList)) {
    badanList.forEach((b) => {
      if (b && b.id) {
        map[b.id] = {
          startDate: b.monitoring_start_date || null,
          status: b.monitoring_status || 'menunggu',
          extraDays: Boolean(b.monitoring_extra_days),
          respondedAt: b.monitoring_responded_at || null,
          closedAt: b.monitoring_closed_at || null,
        };
      }
    });
  }

  // Merge with localStorage for offline or legacy cache
  try {
    const raw = localStorage.getItem(MONITORING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([id, val]) => {
          if (!map[id] || !map[id].startDate) {
            map[id] = { ...map[id], ...val };
          }
        });
      }
    }
  } catch (_err) {
    // ignore
  }

  return map;
};

export const saveMonitoringMap = (map) => {
  try {
    localStorage.setItem(MONITORING_KEY, JSON.stringify(map || {}));
  } catch (err) {
    // ignore
  }
};
