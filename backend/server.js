import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import {db} from "./src/models/index.js";

import authRoutes from "./src/routes/authRoutes.js";
import configRoutes from "./src/routes/configRoutes.js";
import badanPublikRoutes from "./src/routes/badanPublikRoutes.js";
import emailRoutes from "./src/routes/emailRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import quotaRoutes from "./src/routes/quotaRoutes.js";
import holidayRoutes from "./src/routes/holidayRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js";
import ujiAksesReportRoutes from "./src/routes/ujiAksesReportRoutes.js";
import adminUjiAksesReportRoutes from "./src/routes/adminUjiAksesReportRoutes.js";
import ujiAksesQuestionRoutes from "./src/routes/ujiAksesQuestionRoutes.js";
import { seedUjiAksesQuestionsIfEmpty } from "./src/utils/seedUjiAksesQuestions.js";
import helmet from "helmet";
import { sanitizeMiddleware, sanitizeQueryParams } from "./src/middleware/sanitization.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// __dirname replacement untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Catatan: untuk cookie auth, biasanya perlu konfigurasi cors lebih spesifik (origin + credentials).
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // URL frontend Vite
  credentials: true // WAJIB untuk cookie
}));
app.use(
  express.json({
    limit: "25mb", // naikkan limit agar lampiran base64 tidak ditolak
  })
);
app.use(cookieParser());
// ✅ SANITIZE SEMUA INPUT
app.use(sanitizeMiddleware);
app.use(sanitizeQueryParams);
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => {
  res.json({
    message: "Otomatisasi API is running",
    time: new Date().toString(),
  });
});

app.use("/auth", authRoutes);
app.use("/config", configRoutes);
app.use("/badan-publik", badanPublikRoutes);
app.use("/email", emailRoutes);
app.use("/users", userRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/quota", quotaRoutes);
app.use("/holidays", holidayRoutes);
app.use("/news", newsRoutes);

// Static files untuk bukti dukung laporan uji akses
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Modul Laporan Uji Akses
app.use("/api/reports", ujiAksesReportRoutes);
app.use("/api/admin/reports", adminUjiAksesReportRoutes);
app.use("/uji-akses/questions", ujiAksesQuestionRoutes);

// Bootstrapping server + koneksi database
const startServer = async () => {
  try {
    await db.sync();
    await seedUjiAksesQuestionsIfEmpty();
    console.log("Koneksi database berhasil");

    app.listen(PORT, () => {
      console.log(`Server berjalan pada port ${PORT}`);
    });
  } catch (err) {
    console.error("Gagal konek database", err);
    process.exit(1);
  }
};

startServer();
