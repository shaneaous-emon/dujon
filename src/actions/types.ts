/** Result shape returned by every form action (error values are message keys under `errors.*`). */
export interface FormState {
  ok?: boolean;
  /** field name → error code */
  errors?: Record<string, string>;
  /** non-field message code (under `errors.*`) */
  formError?: string;
  /** extra values for ICU messages, e.g. { minutes: 12 } */
  values?: Record<string, string | number>;
  /** echo of submitted (non-secret) text fields so the form keeps its content */
  fields?: Record<string, string>;
  /** success message key (under `notices.*`) */
  notice?: string;
}

export const initialState: FormState = {};

export function str(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v : "";
}

export function echo(fd: FormData, names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of names) out[n] = str(fd, n);
  return out;
}

/** Same-origin relative redirect targets only (FR-AUTH-012). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes("://")) return null;
  return next;
}
