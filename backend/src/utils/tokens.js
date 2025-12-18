import crypto from "crypto";

export function generateRefreshToken() {
  // 64 bytes => string panjang, sulit ditebak
  return crypto.randomBytes(64).toString("base64url");
}

export function hashRefreshToken(refreshToken) {
  // HMAC supaya kalau DB bocor, attacker tidak dapat token asli
  return crypto
    .createHmac("sha256", process.env.REFRESH_TOKEN_HASH_SECRET)
    .update(refreshToken)
    .digest("hex");
}
