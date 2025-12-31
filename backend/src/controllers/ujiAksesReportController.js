import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import {
  UjiAksesReport,
  BadanPublik,
  User,
  Assignment,
  UjiAksesQuestion,
  UjiAksesOption,
} from "../models/index.js";
import {
  computeAnswersAndTotal,
  validateSubmittedAnswers,
  normalizeMaybeJson,
} from "../utils/ujiAksesScoring.js";

// Constants
const VALID_STATUSES = ["submitted"];
const SORT_FIELDS = ["total_skor", "createdAt"];
const DEFAULT_SORT = { field: "createdAt", direction: "DESC" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
const ensureUploadsDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    // ignore
  }
};

const userCanAccessBadanPublik = async (user, badanPublikId) => {
  if (user?.role === "admin") return true;

  const assignment = await Assignment.findOne({
    where: { user_id: user.id, badan_publik_id: badanPublikId },
    attributes: ["id"],
  });

  return Boolean(assignment);
};

const loadQuestions = async () => {
  return UjiAksesQuestion.findAll({
    include: [{ model: UjiAksesOption, as: "options" }],
    order: [
      ["order", "ASC"],
      [{ model: UjiAksesOption, as: "options" }, "order", "ASC"],
    ],
  });
};

const toRubric = (questions = []) => {
  return questions.map((q) => ({
    key: q.key,
    section: q.section,
    text: q.text,
    order: q.order,
    options: (q.options || []).map((o) => ({
      key: o.key,
      label: o.label,
      score: o.score,
      order: o.order,
    })),
  }));
};

const toPlainReport = (reportInstance) => {
  if (!reportInstance) return null;

  const plain =
    typeof reportInstance.toJSON === "function"
      ? reportInstance.toJSON()
      : { ...reportInstance };

  plain.answers = normalizeMaybeJson(plain.answers);
  plain.evidences = normalizeMaybeJson(plain.evidences);

  return plain;
};

const getReportOr403 = async (req, res, reportId) => {
  const report = await UjiAksesReport.findByPk(reportId, {
    include: [
      { model: BadanPublik, as: "badanPublik" },
      { model: User, as: "user", attributes: ["id", "username", "role"] },
    ],
  });

  if (!report) {
    res.status(404).json({ message: "Report tidak ditemukan" });
    return null;
  }

  if (req.user.role !== "admin" && report.user_id !== req.user.id) {
    res.status(403).json({ message: "Akses ditolak" });
    return null;
  }

  return report;
};

const updateBadanPublikStatus = async (badanPublikId, status) => {
  await BadanPublik.update({ status }, { where: { id: badanPublikId } });
};

const createReport = async (req, res) => {
  try {
    const { badanPublikId, badan_publik_id, answers = {} } = req.body;
    const targetBadanPublikId = Number(badanPublikId ?? badan_publik_id);

    if (!targetBadanPublikId) {
      return res.status(400).json({ message: "badanPublikId wajib diisi" });
    }

    const badanPublik = await BadanPublik.findByPk(targetBadanPublikId, {
      attributes: ["id"],
    });

    if (!badanPublik) {
      return res.status(404).json({ message: "Badan publik tidak ditemukan" });
    }

    const canAccess = await userCanAccessBadanPublik(
      req.user,
      targetBadanPublikId
    );
    if (!canAccess) {
      return res.status(403).json({
        message: "Badan publik tidak termasuk penugasan Anda",
      });
    }

    const existing = await UjiAksesReport.findOne({
      where: { user_id: req.user.id, badan_publik_id: targetBadanPublikId },
      include: [{ model: BadanPublik, as: "badanPublik" }],
    });
    if (existing) {
      return res.status(409).json({
        message: "Laporan untuk badan publik ini sudah ada",
        report: toPlainReport(existing),
      });
    }

    const questions = await loadQuestions();
    const computed = computeAnswersAndTotal(toRubric(questions), answers);

    const missing = validateSubmittedAnswers(
      toRubric(questions),
      computed.answers
    );
    if (missing.length) {
      return res.status(400).json({
        message: `Jawaban belum lengkap: ${missing.join(", ")}`,
      });
    }

    const report = await UjiAksesReport.create({
      user_id: req.user.id,
      badan_publik_id: targetBadanPublikId,
      status: "submitted",
      total_skor: computed.totalSkor,
      answers: computed.answers,
      evidences: {},
      submitted_at: new Date(),
    });

    await updateBadanPublikStatus(targetBadanPublikId, "selesai");

    return res.status(201).json(toPlainReport(report));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal membuat report" });
  }
};

const listMyReports = async (req, res) => {
  try {
    const reports = await UjiAksesReport.findAll({
      where: { user_id: req.user.id },
      include: [{ model: BadanPublik, as: "badanPublik" }],
      order: [["createdAt", "DESC"]],
    });

    return res.json(reports.map(toPlainReport));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengambil laporan" });
  }
};

const getReportDetail = async (req, res) => {
  try {
    const report = await getReportOr403(req, res, req.params.id);
    if (!report) return;

    const questions = await loadQuestions();

    return res.json({
      report: toPlainReport(report),
      rubric: toRubric(questions),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengambil detail laporan" });
  }
};

const submitReport = async (req, res) => {
  try {
    const report = await getReportOr403(req, res, req.params.id);
    if (!report) return;

    const questions = await loadQuestions();
    const answers = req.body?.answers ?? report.answers ?? {};
    const computed = computeAnswersAndTotal(toRubric(questions), answers);
    const missing = validateSubmittedAnswers(
      toRubric(questions),
      computed.answers
    );

    if (missing.length) {
      return res.status(400).json({
        message: `Jawaban belum lengkap: ${missing.join(", ")}`,
      });
    }

    await report.update({
      status: "submitted",
      answers: computed.answers,
      total_skor: computed.totalSkor,
      submitted_at: new Date(),
    });

    await updateBadanPublikStatus(report.badan_publik_id, "selesai");

    return res.json(toPlainReport(report));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal submit laporan" });
  }
};

const adminListReports = async (req, res) => {
  try {
    const searchQuery = String(req.query.q || "").trim();
    const badanPublikId = req.query.badanPublikId
      ? Number(req.query.badanPublikId)
      : null;
    const statusFilter = req.query.status ? String(req.query.status) : "";
    const sortBy = SORT_FIELDS.includes(String(req.query.sortBy))
      ? String(req.query.sortBy)
      : DEFAULT_SORT.field;
    const sortDir =
      String(req.query.sortDir).toLowerCase() === "asc" ? "ASC" : "DESC";

    const where = {};
    if (badanPublikId) where.badan_publik_id = badanPublikId;
    if (VALID_STATUSES.includes(statusFilter)) where.status = statusFilter;

    const include = [
      { model: BadanPublik, as: "badanPublik" },
      { model: User, as: "user", attributes: ["id", "username", "role"] },
    ];

    if (searchQuery) {
      include[0].where = {
        [Op.or]: [
          { nama_badan_publik: { [Op.like]: `%${searchQuery}%` } },
          { kategori: { [Op.like]: `%${searchQuery}%` } },
        ],
      };
      include[0].required = true;
    }

    const reports = await UjiAksesReport.findAll({
      where,
      include,
      order: [[sortBy, sortDir]],
    });

    return res.json(reports.map(toPlainReport));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengambil laporan admin" });
  }
};

const uploadEvidence = async (req, res) => {
  try {
    const report = await getReportOr403(req, res, req.params.id);
    if (!report) return;

    const questionKey = String(
      req.body?.questionKey || req.query?.questionKey || ""
    ).trim();
    const questions = await loadQuestions();
    const validKeys = new Set(questions.map((q) => q.key));

    if (!validKeys.has(questionKey)) {
      return res.status(400).json({ message: "questionKey tidak valid" });
    }

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "File bukti tidak ditemukan" });
    }

    const currentEvidences = normalizeMaybeJson(report.evidences);
    const evidencesList = Array.isArray(currentEvidences[questionKey])
      ? [...currentEvidences[questionKey]]
      : [];

    if (evidencesList.length + files.length > 2) {
      return res.status(400).json({
        message: "Maksimal 2 file per pertanyaan",
      });
    }

    for (const file of files) {
      evidencesList.push({
        path: file.path
          .replace(/\\/g, "/")
          .replace(/^.*?(\/uploads\/)/, "/uploads/"),
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    const updatedEvidences = {
      ...currentEvidences,
      [questionKey]: evidencesList,
    };

    await report.update({ evidences: updatedEvidences });

    return res.json({ evidences: updatedEvidences });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal upload bukti" });
  }
};

const deleteEvidence = async (req, res) => {
  try {
    const report = await getReportOr403(req, res, req.params.id);
    if (!report) return;

    const questionKey = String(req.body?.questionKey || "").trim();
    const evidencePath = String(req.body?.path || "").trim().replace(/\\/g, "/");

    if (!questionKey || !evidencePath) {
      return res.status(400).json({ message: "questionKey dan path wajib diisi" });
    }
    if (!evidencePath.startsWith("/uploads/")) {
      return res.status(400).json({ message: "Path bukti tidak valid" });
    }

    const currentEvidences = normalizeMaybeJson(report.evidences);
    const evidencesList = Array.isArray(currentEvidences[questionKey])
      ? [...currentEvidences[questionKey]]
      : [];

    const nextList = evidencesList.filter((item) => item?.path !== evidencePath);
    if (nextList.length === evidencesList.length) {
      return res.status(404).json({ message: "Bukti tidak ditemukan" });
    }

    const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads");
    const relative = evidencePath.replace(/^\/uploads\//, "");
    const absolute = path.resolve(uploadsRoot, relative);
    if (absolute.startsWith(uploadsRoot)) {
      fs.unlink(absolute, () => {});
    }

    const updatedEvidences = {
      ...currentEvidences,
      [questionKey]: nextList,
    };

    await report.update({ evidences: updatedEvidences });

    return res.json({ evidences: updatedEvidences });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal menghapus bukti" });
  }
};

const getMyReportByBadanPublik = async (req, res) => {
  try {
    const badanPublikId = Number(req.params.badanPublikId);
    if (!badanPublikId) {
      return res.status(400).json({ message: "badanPublikId tidak valid" });
    }

    const report = await UjiAksesReport.findOne({
      where: { user_id: req.user.id, badan_publik_id: badanPublikId },
      include: [{ model: BadanPublik, as: "badanPublik" }],
    });

    if (!report) {
      return res.json({ report: null });
    }

    return res.json({ report: toPlainReport(report) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal mengambil report" });
  }
};

const getMulterStoragePath = (reportId, questionKey) => {
  return path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "uji-akses-reports",
    String(reportId),
    String(questionKey)
  );
};

const ensureReportUploadDir = (reportId, questionKey) => {
  const dir = getMulterStoragePath(reportId, questionKey);
  ensureUploadsDir(dir);
  return dir;
};

const adminDeleteReportsBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: "IDs wajib diisi" });
    }

    const uniqueIds = [
      ...new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))),
    ];

    if (!uniqueIds.length) {
      return res.status(400).json({ message: "IDs tidak valid" });
    }

    const deleted = await UjiAksesReport.destroy({
      where: { id: uniqueIds },
    });

    return res.json({
      message: `Berhasil menghapus ${deleted} laporan.`,
      deleted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal menghapus laporan terpilih" });
  }
};

export {
  createReport,
  listMyReports,
  getReportDetail,
  submitReport,
  adminListReports,
  uploadEvidence,
  deleteEvidence,
  ensureReportUploadDir,
  getMulterStoragePath,
  adminDeleteReportsBulk,
  getMyReportByBadanPublik,
};
