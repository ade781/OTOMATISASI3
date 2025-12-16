const resetDailyUsageIfNeeded = async (user) => {
  const today = new Date().toISOString().slice(0, 10);
  if (user.last_reset_date !== today) {
    user.used_today = 0;
    user.last_reset_date = today;
    await user.save();
  }
  return user;
};

module.exports = {
  resetDailyUsageIfNeeded
};
