const { Assignment } = require('../models');

const getAssignedBadanPublikIds = async (userId) => {
  const rows = await Assignment.findAll({
    where: { user_id: userId },
    attributes: ['badan_publik_id']
  });
  return rows.map((r) => r.badan_publik_id);
};

const ensureUserCanAccessBadanPublik = async (user, badanPublikId) => {
  if (user?.role === 'admin') return true;
  if (!user?.id) return false;
  const ids = await getAssignedBadanPublikIds(user.id);
  return ids.includes(Number(badanPublikId));
};

module.exports = {
  getAssignedBadanPublikIds,
  ensureUserCanAccessBadanPublik
};
