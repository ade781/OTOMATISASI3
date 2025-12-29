import jwt from "jsonwebtoken";

/**
 * Middleware untuk extract informasi user dari token untuk keperluan logging.
 * Tidak memblokir request jika token tidak valid/tidak ada.
 * Catatan: untuk logging cukup decode (lebih ringan), bukan verify.
 */
export const extractUserForLogging = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) return next();

  try {
    const decoded = jwt.decode(token);

    // Pastikan bentuk decoded sesuai (object)
    if (decoded && typeof decoded === "object") {
      req.user = decoded;
    }
  } catch (_) {
    // ignore: tetap lanjut tanpa req.user
  }

  return next();
};
