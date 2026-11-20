import { describe, expect, it } from "vitest";
import { checkMessages, flattenMessages } from "@/lib/i18n-check";

describe("TC-015 message key parity (FR-I18N-004)", () => {
  it("flattens nested keys", () => {
    expect(flattenMessages({ a: { b: "x", c: { d: "y" } } })).toEqual({ "a.b": "x", "a.c.d": "y" });
  });

  it("passes when locales match", () => {
    expect(checkMessages({ bn: { a: "{n} বছর" }, en: { a: "{n} years" } })).toEqual([]);
  });

  it("reports missing keys", () => {
    const issues = checkMessages({ bn: { a: "ক", b: "খ" }, en: { a: "A" } });
    expect(issues).toEqual([{ key: "b", problem: 'missing in "en"' }]);
  });

  it("reports empty values", () => {
    const issues = checkMessages({ bn: { a: " " }, en: { a: "A" } });
    expect(issues[0]?.problem).toContain("empty");
  });

  it("reports invalid ICU syntax", () => {
    const issues = checkMessages({ bn: { a: "{n, plural, other {x}" }, en: { a: "ok" } });
    expect(issues.some((i) => i.problem.includes("invalid ICU"))).toBe(true);
  });

  it("reports placeholder mismatches", () => {
    const issues = checkMessages({ bn: { a: "{age} বছর" }, en: { a: "{years} years" } });
    expect(issues[0]?.problem).toContain("placeholders differ");
  });
});
