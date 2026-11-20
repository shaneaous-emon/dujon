import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import bn from "../../messages/bn.json";
import en from "../../messages/en.json";
import { checkMessages, type Messages } from "@/lib/i18n-check";
import { isLocale } from "@/i18n/routing";

describe("project message files", () => {
  it("TC-015 bn.json and en.json have identical, valid keys", () => {
    expect(checkMessages({ bn: bn as Messages, en: en as Messages })).toEqual([]);
  });

  it("TC-016 Bangla UI shows Bangla digits; English shows Latin digits (FR-I18N-005)", () => {
    const tBn = createTranslator({ locale: "bn", messages: bn, namespace: "common" });
    const tEn = createTranslator({ locale: "en", messages: en, namespace: "common" });
    expect(tBn("yearsOld", { age: 28 })).toBe("২৮ বছর");
    expect(tEn("yearsOld", { age: 28 })).toBe("28 years");
  });

  it("uses Bangla plural formatting with Bangla digits", () => {
    const tBn = createTranslator({ locale: "bn", messages: bn, namespace: "errors" });
    expect(tBn("formSummary", { count: 3 })).toBe("৩টি তথ্য ঠিক করতে হবে");
  });
});

describe("locale helpers", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("bn")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
