import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

import { db } from "./src/models/index.js";
import { User } from "./src/models/index.js";

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
import logger from "./src/config/logger.js";
import { requestLogger, errorLogger } from "./src/middleware/requestLogger.js";
import { extractUserForLogging } from "./src/middleware/extractUserForLogging.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const rawClientUrls = process.env.CLIENT_URLS || process.env.CLIENT_URL || "";
const configuredClientUrls = rawClientUrls
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const normalizeOrigin = (value) => String(value || "").replace(/\/$/, "");
const configuredClientOrigins = configuredClientUrls.map(normalizeOrigin);
const parseHostname = (value) => {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
};
// __dirname replacement untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Catatan: untuk cookie auth, biasanya perlu konfigurasi cors lebih spesifik (origin + credentials)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],

        // Turnstile + inline scripts dari React/Vite
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'wasm-unsafe-eval'",
          "https://challenges.cloudflare.com",
        ],

        // Inline style sering dibutuhkan; bisa dikencangkan nanti
        styleSrc: ["'self'", "'unsafe-inline'"],

        imgSrc: ["'self'", "data:", "https:"],

        // Turnstile menggunakan iframe
        frameSrc: ["'self'", "https://challenges.cloudflare.com"],

        // Turnstile melakukan request verifikasi client-side (dan mungkin endpoint lain)
        connectSrc: [
          "'self'",
          "https://challenges.cloudflare.com",
          ...configuredClientOrigins,
          // jika FE dan BE beda origin, tambahkan API domain Anda di sini (bukan CLIENT_URL FE)
          // "https://api.example.com",
        ],

        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],

        // jika Anda tidak butuh embed pihak ketiga, ini bagus
        frameAncestors: ["'none'"],

        // upgrade insecure jika Anda full https (opsional)
        // upgradeInsecureRequests: [],
      },
    },

    // Ini sudah default di Helmet modern, tapi boleh eksplisit
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Allow assets (uploads) to be loaded from different origin (frontend dev server)
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Permissions policy untuk XR spatial tracking dan features lain
    permissionsPolicy: {
      "xr-spatial-tracking": [],
      "geolocation": [],
      "microphone": [],
      "camera": [],
    },
  })
);

const getRequestHostname = (req) => {
  const rawHost =
    (req.headers["x-forwarded-host"] || req.headers.host || "")
      .toString()
      .split(",")[0]
      .trim();
  return rawHost.split(":")[0];
};

const isAllowedOrigin = (origin, req) => {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);

  // Exact match dengan daftar origin dari env (CLIENT_URL / CLIENT_URLS)
  if (configuredClientOrigins.includes(normalizedOrigin)) return true;

  // Allow localhost variants
  if (
    normalizedOrigin === "http://localhost:5173" ||
    normalizedOrigin === "http://127.0.0.1:5173"
  ) {
    return true;
  }

  // Allow GitHub Codespaces origin pattern: https://<slug>-5173.app.github.dev
  if (/^https:\/\/.+\.app\.github\.dev(:\d+)?$/i.test(normalizedOrigin)) {
    return true;
  }

  // Allow same hostname (beda port/domain path) agar tidak perlu ganti env tiap server
  const originHostname = parseHostname(normalizedOrigin);
  const reqHostname = getRequestHostname(req);
  if (originHostname && reqHostname && originHostname === reqHostname) {
    return true;
  }

  return false;
};

app.use(
  cors((req, callback) => {
    const requestOrigin = req.header("Origin");
    const allowed = isAllowedOrigin(requestOrigin, req);
    if (!allowed && requestOrigin) {
      console.warn(`[CORS] Blocked origin: ${requestOrigin}`);
    }
    callback(null, { origin: allowed, credentials: true });
  })
);
app.use(
  express.json({
    limit: "25mb", // naikkan limit agar lampiran base64 tidak ditolak
  })
);
app.use(cookieParser());
// Extract user info dari token untuk logging (tidak memblock request)
app.use(extractUserForLogging);
// log setiap request
app.use(requestLogger);

// SANITIZE SEMUA INPUT
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Modul Laporan Uji Akses
app.use("/api/reports", ujiAksesReportRoutes);
app.use("/api/admin/reports", adminUjiAksesReportRoutes);
app.use("/uji-akses/questions", ujiAksesQuestionRoutes);
// Middleware untuk log error
app.use(errorLogger);

// Error handler terakhir
app.use((err, req, res, next) => {
  // Error sudah di-log oleh errorLogger middleware
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});


async function ensureDefaultAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin*#';
  const existing = await User.findOne({ where: { username } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role: 'admin' });
    console.log(`[seed] User admin '${username}' dibuat saat startup.`);
  }
}

// Bootstrapping server + koneksi database
const startServer = async () => {
  try {
    await db.sync();
    await seedUjiAksesQuestionsIfEmpty();
    await ensureDefaultAdmin();
    logger.info('Database connection successful');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to connect to database', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

startServer();
