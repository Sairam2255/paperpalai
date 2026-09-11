const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const secret = process.env.GEMINI_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error(
      "GEMINI_KEY_ENCRYPTION_SECRET is missing from server environment."
    );
  }

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
};

const encryptSecret = (plainText) => {
  if (!plainText) {
    throw new Error("Nothing to encrypt.");
  }

  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

const decryptSecret = (encryptedValue) => {
  if (!encryptedValue) {
    return "";
  }

  const parts = encryptedValue.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted secret format.");
  }

  const [ivBase64, authTagBase64, encryptedBase64] =
    parts;

  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivBase64, "base64")
  );

  decipher.setAuthTag(
    Buffer.from(authTagBase64, "base64")
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encryptedBase64, "base64")
    ),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

module.exports = {
  encryptSecret,
  decryptSecret,
};