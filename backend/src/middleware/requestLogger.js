import logger from "../config/logger.js";

/**
 * Middleware untuk log setiap HTTP request (incoming + completed/failed).
 * Menggunakan res.on('finish') agar mencakup semua jenis response.
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Informasi user jika ada (di-set oleh extractUserForLogging)
  const userId = req.user?.id;
  const username = req.user?.username;

  const base = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    ...(userId ? { userId } : {}),
    ...(username ? { username } : {}),
  };

  logger.http("Incoming request", base);

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const done = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ...(userId ? { userId } : {}),
      ...(username ? { username } : {}),
    };

    if (res.statusCode >= 400) logger.warn("Request failed", done);
    else logger.http("Request completed", done);
  });

  return next();
};

/**
 * Middleware untuk log error (gunakan setelah routes).
 */
export const errorLogger = (err, req, res, next) => {
  const userId = req.user?.id;
  const username = req.user?.username;

  const logData = {
    method: req.method,
    url: req.originalUrl,
    error: err?.message,
    stack: err?.stack,
    statusCode: err?.statusCode || 500,
    ip: req.ip,
    ...(userId ? { userId } : {}),
    ...(username ? { username } : {}),
  };

  logger.error("Error occurred", logData);

  return next(err);
};
