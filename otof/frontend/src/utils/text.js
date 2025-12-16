// Utility teks bersama (hindari duplikasi helper kecil)
export const truncateText = (text, limit = 50, suffix = '...') => {
  if (!text) return '';
  const str = String(text);
  if (str.length <= limit) return str;
  return `${str.slice(0, limit)}${suffix}`;
};
