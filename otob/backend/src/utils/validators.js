// Kumpulan utilitas validasi sederhana
const isValidEmail = (val) => {
  if (!val) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

module.exports = {
  isValidEmail
};
