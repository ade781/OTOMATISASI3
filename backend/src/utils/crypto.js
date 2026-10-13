import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

const getSecretKey = () => {
  const secret =
    process.env.APP_ENCRYPTION_KEY ||
    process.env.REFRESH_TOKEN_HASH_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    "otomatisasi3-default-fallback-secret-key-32";

  // Derive 32-byte key using sha256
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypts plain text using AES-256-GCM
 * Returns formatted string: iv:tag:ciphertext (hex)
 */
export const encrypt = (text) => {
  if (!text) return text;
  try {
    const key = getSecretKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(String(text), "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${tag}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
};

/**
 * Decrypts string encrypted with encrypt()
 * Supports legacy unencrypted values gracefully (backward compatibility)
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;

  // Check format iv:tag:ciphertext (hex)
  const parts = String(encryptedText).split(":");
  if (parts.length !== 3) {
    // Legacy unencrypted plaintext
    return encryptedText;
  }

  const [ivHex, tagHex, cipherHex] = parts;
  if (ivHex.length !== IV_LENGTH * 2 || tagHex.length !== TAG_LENGTH * 2) {
    // Not valid GCM format, return as-is
    return encryptedText;
  }

  try {
    const key = getSecretKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // If decryption fails, it might be unencrypted string that coincidentally contained colons
    console.warn("Decryption failed, falling back to raw text:", err.message);
    return encryptedText;
  }
};
