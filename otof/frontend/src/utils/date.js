// Formatter tanggal/waktu sederhana agar konsisten
export const formatDateTime = (value, locale = 'id-ID', options) => {
  if (!value) return '';
  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      ...(options || {})
    });
    return fmt.format(new Date(value));
  } catch (err) {
    return String(value);
  }
};
