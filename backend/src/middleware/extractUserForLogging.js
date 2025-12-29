import jwt from "jsonwebtoken";

/**
 * Middleware untuk extract informasi user dari token untuk keperluan logging.
 * Berbeda dengan verifyToken, middleware ini TIDAK memblock request jika token tidak valid/tidak ada.
 * Hanya mencoba mendecode token dan menyimpan info user di req.user untuk logging.
 */
export const extractUserForLogging = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    // Tidak ada token, lanjutkan tanpa set req.user
    return next();
  }

  try {
    // Coba decode token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // Set req.user untuk keperluan logging
    req.user = decoded;
  } catch (err) {
    // Token tidak valid, tapi tetap lanjutkan (jangan block request)
    // req.user tetap undefined
  }

  next();
};
