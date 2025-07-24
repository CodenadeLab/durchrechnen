import { randomBytes } from "node:crypto";

/**
 * Generates a new API key with the format dr_{random_string}
 * @returns A new API key string
 */
export function generateApiKey(): string {
  // Generate 32 random bytes and convert to hex
  const randomString = randomBytes(32).toString("hex");
  return `dr_${randomString}`;
}

/**
 * Validates if a string is a valid API key format
 * @param key The key to validate
 * @returns True if the key starts with 'dr_' and has the correct length
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith("dr_") && key.length === 67; // dr_ (3) + 64 hex chars
}
