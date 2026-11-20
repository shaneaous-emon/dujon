import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Argon2id parameters (OWASP baseline: m=19 MiB, t=2, p=1), docs/09 §3.
const OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTS);
}

export async function verifyPassword(hashed: string | null, password: string): Promise<boolean> {
  if (!hashed) return false;
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | null = null;
/** Spend equal time for unknown e-mails so login timing does not reveal which accounts exist. */
export async function burnPasswordTime(password: string): Promise<void> {
  dummy ??= hashPassword("dummy-password-for-timing");
  await verifyPassword(await dummy, password);
}
