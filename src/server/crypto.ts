import "server-only";
import { createHash, randomBytes, randomInt } from "node:crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** URL-safe random token (256 bits). The raw value goes to the user; only its SHA-256 is stored. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
/** Random public identifier, no ambiguous characters (no 0/o/1/l/i). */
export function randomPublicId(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
