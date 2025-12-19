import DEFAULT_QUESTIONS from './ujiAksesDefaults.js';
import { db, UjiAksesQuestion, UjiAksesOption } from '../models/index.js';

export const seedUjiAksesQuestions = async ({ force = false } = {}) => {
  const count = await UjiAksesQuestion.count();
  if (!force && count > 0) {
    return { created: false, count };
  }

  return db.transaction(async (transaction) => {
    if (count > 0) {
      await UjiAksesOption.destroy({ where: {}, transaction });
      await UjiAksesQuestion.destroy({ where: {}, transaction });
    }

    const createdQuestions = await UjiAksesQuestion.bulkCreate(
      DEFAULT_QUESTIONS.map((q, idx) => ({
        key: q.key,
        section: q.section || null,
        text: q.text,
        order: idx + 1
      })),
      { transaction }
    );

    const optionsPayload = [];
    createdQuestions.forEach((q, idx) => {
      const source = DEFAULT_QUESTIONS[idx];
      (source.options || []).forEach((opt, optIdx) => {
        optionsPayload.push({
          question_id: q.id,
          key: opt.key,
          label: opt.label,
          score: Number(opt.score) || 0,
          order: optIdx + 1
        });
      });
    });

    if (optionsPayload.length) {
      await UjiAksesOption.bulkCreate(optionsPayload, { transaction });
    }

    return { created: true, count: createdQuestions.length };
  });
};

export const seedUjiAksesQuestionsIfEmpty = async () => seedUjiAksesQuestions({ force: false });
