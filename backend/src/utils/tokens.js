import crypto from "crypto";

export const generateRefreshToken = () => {
  // 64 bytes => string panjang, sulit ditebak
  return crypto.randomBytes(64).toString("base64url");
};

export const hashRefreshToken = (refreshToken) => {
  // HMAC supaya kalau DB bocor, attacker tidak dapat token asli
  return crypto
    .createHmac("sha256", process.env.REFRESH_TOKEN_HASH_SECRET)
    .update(refreshToken)
    .digest("hex");
};

// CSRF token untuk proteksi CSRF pada request state-changing
export const generateCsrfToken = async () => {
  return crypto.randomBytes(32).toString("base64url");
};
