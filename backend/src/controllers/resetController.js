import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  db,
  User,
  BadanPublik,
  SmtpConfig,
  EmailLog,
  Assignment,
  QuotaRequest,
  Holiday,
  UjiAksesReport,
  UjiAksesQuestion,
  UjiAksesOption,
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clearUploadsDir = () => {
  const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadsRoot)) return;
  const entries = fs.readdirSync(uploadsRoot);
  entries.forEach((entry) => {
    const target = path.join(uploadsRoot, entry);
    fs.rmSync(target, { recursive: true, force: true });
  });
};

const resetDatabase = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const results = {};

    results.emailLogs = await EmailLog.destroy({ where: {}, transaction });
    results.assignments = await Assignment.destroy({ where: {}, transaction });
    results.quotaRequests = await QuotaRequest.destroy({ where: {}, transaction });
    results.smtpConfigs = await SmtpConfig.destroy({ where: {}, transaction });
    results.ujiAksesReports = await UjiAksesReport.destroy({ where: {}, transaction });
    results.ujiAksesOptions = await UjiAksesOption.destroy({ where: {}, transaction });
    results.ujiAksesQuestions = await UjiAksesQuestion.destroy({ where: {}, transaction });
    results.holidays = await Holiday.destroy({ where: {}, transaction });
    results.badanPublik = await BadanPublik.destroy({ where: {}, transaction });
    results.users = await User.destroy({
      where: { role: { [Op.ne]: "admin" } },
      transaction,
    });

    await transaction.commit();
    clearUploadsDir();

    return res.json({
      message: "Reset database berhasil. Semua data dihapus kecuali user admin.",
      deleted: results,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ message: "Gagal mereset database" });
  }
};

export { resetDatabase };
