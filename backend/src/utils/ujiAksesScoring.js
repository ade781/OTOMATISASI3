const looksLikeCharMap = (val) => {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  const keys = Object.keys(val);
  if (keys.length === 0) return false;
  return keys.every((key, idx) => key === String(idx) && typeof val[key] === 'string' && val[key].length === 1);
};

const decodeCharMap = (val) => {
  try {
    const sortedKeys = Object.keys(val)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    const combined = sortedKeys.map((k) => val[String(k)]).join('');
    const parsed = JSON.parse(combined);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_err) {
    return {};
  }
};

export const normalizeMaybeJson = (val) => {
  if (!val) return {};
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_err) {
      return {};
    }
  }
  if (typeof val === 'object') {
    if (looksLikeCharMap(val)) {
      return decodeCharMap(val);
    }
    return val;
  }
  return {};
};

const buildOptionScoreMap = (questions = []) => {
  const map = new Map();
  for (const q of questions) {
    const qMap = new Map();
    (q.options || []).forEach((opt) => {
      qMap.set(opt.key, Number(opt.score) || 0);
    });
    map.set(q.key, qMap);
  }
  return map;
};

export const computeAnswersAndTotal = (questions = [], inputAnswers = {}) => {
  const normalizedInput = normalizeMaybeJson(inputAnswers);
  const computedAnswers = {};
  let total = 0;
  const optionMap = buildOptionScoreMap(questions);

  for (const q of questions) {
    const raw = normalizedInput?.[q.key] || {};
    const optionKey = raw.optionKey || raw.option_key || null;
    const note = raw.catatan ?? raw.note ?? null;
    const score = optionKey && optionMap.get(q.key)?.has(optionKey) ? optionMap.get(q.key).get(optionKey) : 0;

    computedAnswers[q.key] = {
      optionKey: optionKey || null,
      score,
      catatan: note ? String(note).slice(0, 2000) : null
    };
    total += score;
  }

  return { answers: computedAnswers, totalSkor: total };
};

export const validateSubmittedAnswers = (questions = [], answers = {}) => {
  const normalized = normalizeMaybeJson(answers);
  const missing = [];
  for (const q of questions) {
    const opt = normalized?.[q.key]?.optionKey;
    if (!opt) missing.push(q.key);
  }
  return missing;
};
