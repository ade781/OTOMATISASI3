export const normalizeAnswers = (questions = [], answersFromServer = {}) => {
  const next = {};
  questions.forEach((q) => {
    const raw = answersFromServer?.[q.key] || {};
    next[q.key] = { optionKey: raw.optionKey || null, catatan: raw.catatan || '' };
  });
  return next;
};

const buildOptionScoreMap = (questions = []) => {
  const map = new Map();
  questions.forEach((q) => {
    map.set(q.key, new Map((q.options || []).map((o) => [o.key, Number(o.score) || 0])));
  });
  return map;
};

export const computeUjiAksesScores = (questions = [], inputAnswers = {}) => {
  const answers = {};
  let totalSkor = 0;
  const scoreMap = buildOptionScoreMap(questions);
  questions.forEach((q) => {
    const raw = inputAnswers?.[q.key] || {};
    const optionKey = raw.optionKey || null;
    const catatan = raw.catatan ?? '';
    const score = optionKey && scoreMap.get(q.key)?.has(optionKey) ? scoreMap.get(q.key).get(optionKey) : 0;
    answers[q.key] = { optionKey, score, catatan };
    totalSkor += score;
  });
  return { answers, totalSkor };
};

export const isUjiAksesComplete = (questions = [], answers = {}) =>
  questions.every((q) => Boolean(answers?.[q.key]?.optionKey));
