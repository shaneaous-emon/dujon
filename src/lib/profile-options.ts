export const GENDERS = ["male", "female"] as const;
export const CREATED_BY = ["self", "parent", "guardian", "sibling", "relative"] as const;
export const MARITAL = ["never_married", "divorced", "widowed"] as const;
export const EDUCATION = ["below_ssc", "ssc", "hsc", "diploma", "bachelors", "masters", "doctorate", "other"] as const;
export const PHOTO_VISIBILITY = ["members", "connections"] as const;
export const REPORT_REASONS = [
  "fake_profile",
  "inappropriate_photo",
  "harassment",
  "money_request_or_scam",
  "appears_underage",
  "married_or_misleading",
  "other",
] as const;
export const CONTACT_SUBJECTS = ["general", "account_help", "safety", "feedback", "other"] as const;

export type Gender = (typeof GENDERS)[number];
export type CreatedBy = (typeof CREATED_BY)[number];
export type MaritalStatus = (typeof MARITAL)[number];
export type EducationLevel = (typeof EDUCATION)[number];
export type PhotoVisibility = (typeof PHOTO_VISIBILITY)[number];
export type ReportReason = (typeof REPORT_REASONS)[number];

export function oppositeGender(g: Gender): Gender {
  return g === "male" ? "female" : "male";
}

/** Height helper: cm ↔ feet/inches. */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
