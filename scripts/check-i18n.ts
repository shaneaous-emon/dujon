/* FR-I18N-004 — run with `pnpm i18n:check`. Exits non-zero on any issue. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkMessages, type Messages } from "../src/lib/i18n-check";
import { locales } from "../src/i18n/routing";

const byLocale: Record<string, Messages> = {};
for (const locale of locales) {
  const file = join(process.cwd(), "messages", `${locale}.json`);
  byLocale[locale] = JSON.parse(readFileSync(file, "utf8")) as Messages;
}

const issues = checkMessages(byLocale);
if (issues.length > 0) {
  for (const issue of issues) console.error(`✗ ${issue.key}: ${issue.problem}`);
  console.error(`\n${issues.length} i18n issue(s) found.`);
  process.exit(1);
}
console.log(`✓ i18n check passed (${locales.join(", ")}).`);
