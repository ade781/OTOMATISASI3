import { verifyTurnstileToken } from "../utils/turnstile.js";

export const requireTurnstile = ({ bodyField = "turnstileToken" } = {}) => {
  return async (req, res, next) => {
    try {
      const token = req.body?.[bodyField];

      const result = await verifyTurnstileToken({ token, ip: req.ip });
      if (!result.ok) {
        return res.status(403).json({
          status: "Failed",
          code: "TURNSTILE_FAILED",
          message: "Verifikasi Turnstile gagal",
        });
      }

      return next();
    } catch (err) {
      // pilih policy: kalau Turnstile service error, biasanya kita fail-closed (lebih aman)
      console.error("Turnstile error:", err);
      return res.status(503).json({
        status: "Failed",
        code: "TURNSTILE_UNAVAILABLE",
        message: "Layanan verifikasi tidak tersedia, coba lagi",
      });
    }
  };
}
