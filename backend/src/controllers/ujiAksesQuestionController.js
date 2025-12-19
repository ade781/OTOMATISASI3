import { Op } from 'sequelize';
import { db, UjiAksesQuestion, UjiAksesOption } from '../models/index.js';
import { seedUjiAksesQuestions } from '../utils/seedUjiAksesQuestions.js';

const mapQuestion = (q) => ({
  id: q.id,
  key: q.key,
  section: q.section,
  text: q.text,
  order: q.order,
  options: (q.options || []).map((o) => ({
    id: o.id,
    key: o.key,
    label: o.label,
    score: o.score,
    order: o.order
  }))
});

const getNextQuestionKey = async () => {
  const existing = await UjiAksesQuestion.findAll({ attributes: ['key'] });
  const numbers = existing
    .map((q) => String(q.key))
    .map((key) => {
      const match = key.match(/^q(\d+)$/i);
      return match ? Number(match[1]) : null;
    })
    .filter((n) => Number.isFinite(n));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `q${next}`;
};

const getNextOptionKey = (existingKeys = []) => {
  const numbers = existingKeys
    .map((key) => {
      const match = String(key).match(/^opt(\d+)$/i);
      return match ? Number(match[1]) : null;
    })
    .filter((n) => Number.isFinite(n));
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `opt${next}`;
};

const listQuestions = async (_req, res) => {
  try {
    const questions = await UjiAksesQuestion.findAll({
      include: [{ model: UjiAksesOption, as: 'options' }],
      order: [
        ['order', 'ASC'],
        [{ model: UjiAksesOption, as: 'options' }, 'order', 'ASC']
      ]
    });
    return res.json(questions.map(mapQuestion));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil pertanyaan' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const payload = req.body || {};
    const text = String(payload.text || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Pertanyaan wajib diisi' });
    }

    const options = Array.isArray(payload.options) ? payload.options : [];
    const cleanedOptions = options
      .map((opt, idx) => ({
        key: opt.key,
        label: String(opt.label || '').trim(),
        score: Number(opt.score) || 0,
        order: Number(opt.order) || idx + 1
      }))
      .filter((opt) => opt.label);
    if (!cleanedOptions.length) {
      return res.status(400).json({ message: 'Opsi jawaban wajib diisi' });
    }

    const key = await getNextQuestionKey();
    const order = Number(payload.order) || (await UjiAksesQuestion.count()) + 1;
    const question = await UjiAksesQuestion.create({
      key,
      section: payload.section || null,
      text,
      order
    });

    const existingKeys = [];
    const optionsPayload = cleanedOptions.map((opt, idx) => {
      const optKey = opt.key || getNextOptionKey(existingKeys);
      existingKeys.push(optKey);
      return {
        question_id: question.id,
        key: optKey,
        label: opt.label,
        score: opt.score,
        order: opt.order || idx + 1
      };
    });

    await UjiAksesOption.bulkCreate(optionsPayload);

    const saved = await UjiAksesQuestion.findByPk(question.id, {
      include: [{ model: UjiAksesOption, as: 'options' }],
      order: [[{ model: UjiAksesOption, as: 'options' }, 'order', 'ASC']]
    });
    return res.status(201).json(mapQuestion(saved));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal membuat pertanyaan' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await UjiAksesQuestion.findByPk(req.params.id, {
      include: [{ model: UjiAksesOption, as: 'options' }]
    });
    if (!question) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }

    const payload = req.body || {};
    const text = String(payload.text || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Pertanyaan wajib diisi' });
    }

    await question.update({
      section: payload.section ?? question.section,
      text,
      order: Number(payload.order) || question.order
    });

    const incoming = Array.isArray(payload.options) ? payload.options : [];
    const cleanedOptions = incoming
      .map((opt, idx) => ({
        id: opt.id,
        key: opt.key,
        label: String(opt.label || '').trim(),
        score: Number(opt.score) || 0,
        order: Number(opt.order) || idx + 1
      }))
      .filter((opt) => opt.label);
    if (!cleanedOptions.length) {
      return res.status(400).json({ message: 'Opsi jawaban wajib diisi' });
    }

    const existingById = new Map(question.options.map((o) => [o.id, o]));
    const keepIds = new Set();
    const usedKeys = new Set(question.options.map((o) => o.key));

    for (const [idx, opt] of cleanedOptions.entries()) {
      if (opt.id && existingById.has(opt.id)) {
        const target = existingById.get(opt.id);
        keepIds.add(target.id);
        await target.update({
          label: opt.label,
          score: opt.score,
          order: opt.order || idx + 1
        });
      } else {
        const optKey = opt.key && !usedKeys.has(opt.key) ? opt.key : getNextOptionKey(Array.from(usedKeys));
        usedKeys.add(optKey);
        const created = await UjiAksesOption.create({
          question_id: question.id,
          key: optKey,
          label: String(opt.label || '').trim(),
          score: Number(opt.score) || 0,
          order: Number(opt.order) || idx + 1
        });
        keepIds.add(created.id);
      }
    }

    const deleteIds = question.options
      .filter((o) => !keepIds.has(o.id))
      .map((o) => o.id);
    if (deleteIds.length) {
      await UjiAksesOption.destroy({ where: { id: { [Op.in]: deleteIds } } });
    }

    const saved = await UjiAksesQuestion.findByPk(question.id, {
      include: [{ model: UjiAksesOption, as: 'options' }],
      order: [[{ model: UjiAksesOption, as: 'options' }, 'order', 'ASC']]
    });
    return res.json(mapQuestion(saved));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memperbarui pertanyaan' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await UjiAksesQuestion.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan' });
    }
    await UjiAksesOption.destroy({ where: { question_id: question.id } });
    await question.destroy();
    return res.json({ message: 'Pertanyaan dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menghapus pertanyaan' });
  }
};

const deleteAllQuestions = async (_req, res) => {
  try {
    await db.transaction(async (transaction) => {
      await UjiAksesOption.destroy({ where: {}, transaction });
      await UjiAksesQuestion.destroy({ where: {}, transaction });
    });
    return res.json({ message: 'Semua pertanyaan dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menghapus semua pertanyaan' });
  }
};

const resetQuestions = async (_req, res) => {
  try {
    const result = await seedUjiAksesQuestions({ force: true });
    return res.json({
      message: 'Pertanyaan dipulihkan ke template',
      count: result?.count || 0
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mereset pertanyaan' });
  }
};

export { listQuestions, createQuestion, updateQuestion, deleteQuestion, deleteAllQuestions, resetQuestions };
