import db from "../config/database.js";

import UserModel from "./user.js";
import BadanPublikModel from "./badanPublik.js";
import SmtpConfigModel from "./smtpConfig.js";
import EmailLogModel from "./emailLog.js";
import AssignmentModel from "./assignment.js";
import QuotaRequestModel from "./quotaRequest.js";
import AssignmentHistoryModel from "./assignmentHistory.js";
import HolidayModel from "./holiday.js";
import UjiAksesReportModel from "./ujiAksesReport.js";

// Inisialisasi model
const User = UserModel(db);
const BadanPublik = BadanPublikModel(db);
const SmtpConfig = SmtpConfigModel(db);
const EmailLog = EmailLogModel(db);
const Assignment = AssignmentModel(db);
const QuotaRequest = QuotaRequestModel(db);
const AssignmentHistory = AssignmentHistoryModel(db);
const Holiday = HolidayModel(db);
const UjiAksesReport = UjiAksesReportModel(db);


// Relasi antar model
// User ↔ SMTP Config
User.hasOne(SmtpConfig, {
  foreignKey: "user_id",
  as: "smtpConfig",
  onDelete: "CASCADE",
});
SmtpConfig.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User ↔ Email Log
User.hasMany(EmailLog, {
  foreignKey: "user_id",
  as: "emailLogs",
});
EmailLog.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Badan Publik ↔ Email Log
BadanPublik.hasMany(EmailLog, {
  foreignKey: "badan_publik_id",
  as: "emailLogs",
});
EmailLog.belongsTo(BadanPublik, {
  foreignKey: "badan_publik_id",
  as: "badanPublik",
});

// User ↔ Badan Publik (Many-to-Many via Assignment)
User.belongsToMany(BadanPublik, {
  through: Assignment,
  as: "assignments",
  foreignKey: "user_id",
  otherKey: "badan_publik_id",
});
BadanPublik.belongsToMany(User, {
  through: Assignment,
  as: "assignees",
  foreignKey: "badan_publik_id",
  otherKey: "user_id",
});

// User ↔ Quota Request
User.hasMany(QuotaRequest, {
  foreignKey: "user_id",
  as: "quotaRequests",
});
QuotaRequest.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Assignment History
AssignmentHistory.belongsTo(User, {
  foreignKey: "actor_id",
  as: "actor",
});
AssignmentHistory.belongsTo(User, {
  foreignKey: "user_id",
  as: "assignee",
});
AssignmentHistory.belongsTo(BadanPublik, {
  foreignKey: "badan_publik_id",
  as: "badanPublik",
});

// Uji Akses Report
User.hasMany(UjiAksesReport, {
  foreignKey: "user_id",
  as: "ujiAksesReports",
});
UjiAksesReport.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

BadanPublik.hasMany(UjiAksesReport, {
  foreignKey: "badan_publik_id",
  as: "ujiAksesReports",
});
UjiAksesReport.belongsTo(BadanPublik, {
  foreignKey: "badan_publik_id",
  as: "badanPublik",
});


// Export
export {
  db,
  User,
  BadanPublik,
  SmtpConfig,
  EmailLog,
  Assignment,
  QuotaRequest,
  AssignmentHistory,
  Holiday,
  UjiAksesReport,
};
