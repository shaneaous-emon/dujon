import { parse, TYPE, type MessageFormatElement } from "@formatjs/icu-messageformat-parser";

/** A nested messages object as stored in messages/<locale>.json. */
export type Messages = { [key: string]: string | Messages };

export interface I18nIssue {
  key: string;
  problem: string;
}

/** Flatten nested messages into "a.b.c" → value. */
export function flattenMessages(messages: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(messages)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else Object.assign(out, flattenMessages(v, key));
  }
  return out;
}

function collectArguments(elements: MessageFormatElement[], into: Set<string>): void {
  for (const el of elements) {
    if (el.type === TYPE.literal || el.type === TYPE.pound) continue;
    if ("value" in el && typeof el.value === "string") into.add(el.value);
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      for (const opt of Object.values(el.options)) collectArguments(opt.value, into);
    }
    if (el.type === TYPE.tag) collectArguments(el.children, into);
  }
}

/** Parse an ICU message and return its argument names, or throw on syntax errors. */
export function messageArguments(message: string): Set<string> {
  const args = new Set<string>();
  collectArguments(parse(message), args);
  return args;
}

/**
 * FR-I18N-004: every key must exist in every locale, be non-empty, be valid ICU,
 * and use the same placeholders in every locale.
 */
export function checkMessages(byLocale: Record<string, Messages>): I18nIssue[] {
  const issues: I18nIssue[] = [];
  const flat = Object.fromEntries(
    Object.entries(byLocale).map(([locale, m]) => [locale, flattenMessages(m)]),
  );
  const allKeys = new Set(Object.values(flat).flatMap((m) => Object.keys(m)));
  for (const key of [...allKeys].sort()) {
    let reference: { locale: string; args: Set<string> } | undefined;
    for (const [locale, messages] of Object.entries(flat)) {
      const value = messages[key];
      if (value === undefined) {
        issues.push({ key, problem: `missing in "${locale}"` });
        continue;
      }
      if (value.trim() === "") {
        issues.push({ key, problem: `empty in "${locale}"` });
        continue;
      }
      let args: Set<string>;
      try {
        args = messageArguments(value);
      } catch (error) {
        issues.push({ key, problem: `invalid ICU in "${locale}": ${(error as Error).message}` });
        continue;
      }
      if (!reference) {
        reference = { locale, args };
      } else {
        const a = [...reference.args].sort().join(",");
        const b = [...args].sort().join(",");
        if (a !== b) {
          issues.push({
            key,
            problem: `placeholders differ: "${reference.locale}" {${a}} vs "${locale}" {${b}}`,
          });
        }
      }
    }
  }
  return issues;
}
