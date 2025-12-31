import { buildServerFileUrl } from './serverUrl';

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  const datePart = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${datePart}: ${timePart}`;
};

export const buildQuestionColumns = (questionList) => {
  return (questionList || []).map((q, idx) => ({
    key: q.key,
    label: `Q${idx + 1}: ${q.text}`,
    options: q.options || []
  }));
};

export const getQuestionScore = (question, answers) => {
  const answer = answers?.[question.key];
  if (!answer) return '';
  const option = (question.options || []).find((opt) => opt.key === answer.optionKey);
  if (!option) return '';
  return option.score ?? '';
};

export const collectEvidenceUrls = (item, questionList) => {
  const evidences = item?.evidences || {};
  const urls = [];
  (questionList || []).forEach((q) => {
    const files = Array.isArray(evidences[q.key]) ? evidences[q.key] : [];
    files.forEach((file) => {
      const url = buildServerFileUrl(file?.path || '');
      if (url) urls.push(url);
    });
  });
  return urls.join(' | ');
};

const buildHeader = (columns, includeUser) => {
  const base = includeUser
    ? ['Tanggal', 'Badan Publik', 'User', 'Total Skor']
    : ['Tanggal', 'Badan Publik', 'Total Skor'];
  return [...base, ...columns.map((q) => q.label), 'Bukti URL'];
};

const buildBaseRow = (item, includeUser) => {
  const base = [
    formatDate(item.created_at || item.createdAt),
    item.badanPublik?.nama_badan_publik || '-'
  ];
  if (includeUser) base.push(item.user?.username || '-');
  base.push(item.total_skor ?? 0);
  return base;
};

const buildBaseObject = (item, includeUser) => {
  const base = {
    Tanggal: formatDate(item.created_at || item.createdAt),
    'Badan Publik': item.badanPublik?.nama_badan_publik || '-'
  };
  if (includeUser) base.User = item.user?.username || '-';
  base['Total Skor'] = item.total_skor ?? 0;
  return base;
};

export const exportUjiAksesCsv = ({ reports, questionList, includeUser, filename }) => {
  const columns = buildQuestionColumns(questionList);
  const rows = (reports || []).map((item) => [
    ...buildBaseRow(item, includeUser),
    ...columns.map((q) => getQuestionScore(q, item.answers)),
    collectEvidenceUrls(item, questionList)
  ]);
  const header = buildHeader(columns, includeUser);
  const toCsv = [header, ...rows]
    .map((cols) =>
      cols
        .map((val) => {
          const safe = (val ?? '').toString().replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(',')
    )
    .join('\n');
  const blob = new Blob([toCsv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportUjiAksesXlsx = async ({ reports, questionList, includeUser, filename }) => {
  const columns = buildQuestionColumns(questionList);
  const { utils, writeFile } = await import('xlsx');
  const rows = (reports || []).map((item) => ({
    ...buildBaseObject(item, includeUser),
    ...columns.reduce((acc, q) => {
      acc[q.label] = getQuestionScore(q, item.answers);
      return acc;
    }, {}),
    'Bukti URL': collectEvidenceUrls(item, questionList)
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Laporan');
  writeFile(wb, filename);
};

export const exportUjiAksesPdf = async ({ reports, questionList, includeUser, filename, title }) => {
  const columns = buildQuestionColumns(questionList);
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  let y = 26;
  (reports || []).forEach((item, idx) => {
    const lines = [
      `${idx + 1}. ${item.badanPublik?.nama_badan_publik || '-'}`,
      includeUser ? `User: ${item.user?.username || '-'}` : null,
      `Tanggal: ${formatDate(item.created_at || item.createdAt)}`,
      `Total Skor: ${item.total_skor ?? 0}`
    ].filter(Boolean);
    columns.forEach((q) => {
      lines.push(`${q.label}: ${getQuestionScore(q, item.answers)}`);
    });
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      wrapped.forEach((chunk) => {
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
        doc.text(chunk, 14, y);
        y += 6;
      });
    });
    y += 2;
  });
  doc.save(filename);
};
