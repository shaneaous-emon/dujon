"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { appConfig } from "@/config/app";
import { CREATED_BY, EDUCATION, MARITAL, PHOTO_VISIBILITY, feetInchesToCm } from "@/lib/profile-options";
import { cleanText, containsContactInfo } from "@/lib/validation";
import { actionUser } from "./guard";
import { echo, str, type FormState } from "./types";
import { exec } from "@/server/db";
import { validateLocation } from "@/server/locations";
import { getOwnProfile, hideProfile, publishProfile } from "@/server/services/profiles";
import { deletePhoto, savePhoto } from "@/server/services/photos";
import { hit, RULES } from "@/server/rate-limit";

const isOneOf = <T extends readonly string[]>(list: T, v: string): v is T[number] => (list as readonly string[]).includes(v);
const num = (s: string): number | null => (/^\d+$/.test(s) ? Number(s) : null);

async function after(mode: string, next: string, notice?: string): Promise<void> {
  revalidatePath("/", "layout");
  if (mode === "onboarding") redirect({ href: next, locale: await getLocale() });
  void notice;
}

/* ------------------------------------------------------------------- step 1 */

export async function saveAboutAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const mode = str(fd, "mode") === "onboarding" ? "onboarding" : "edit";
  const fields = echo(fd, ["displayName", "createdBy", "maritalStatus", "heightFeet", "heightInches", "educationLevel", "educationDetail", "occupation", "about", "familyInfo"]);
  const errors: Record<string, string> = {};

  const displayName = cleanText(fields.displayName!, 40);
  if (displayName.length < 2) errors.displayName = "required";
  const createdBy = fields.createdBy!;
  if (!isOneOf(CREATED_BY, createdBy)) errors.createdBy = "required";
  const maritalStatus = fields.maritalStatus!;
  if (!isOneOf(MARITAL, maritalStatus)) errors.maritalStatus = "required";
  const educationLevel = fields.educationLevel!;
  if (!isOneOf(EDUCATION, educationLevel)) errors.educationLevel = "required";
  const educationDetail = cleanText(fields.educationDetail!, 100);
  const occupation = cleanText(fields.occupation!, 100);
  if (occupation.length < 2) errors.occupation = "required";
  const about = cleanText(fields.about!, 1000);
  if (about.length < 30) errors.about = "aboutShort";
  const familyInfo = cleanText(fields.familyInfo!, 500);

  let heightCm: number | null = null;
  if (fields.heightFeet || fields.heightInches) {
    const ft = num(fields.heightFeet!);
    const inch = num(fields.heightInches || "0");
    if (ft === null || inch === null || inch > 11) errors.height = "invalidHeight";
    else {
      heightCm = feetInchesToCm(ft, inch);
      if (heightCm < 120 || heightCm > 220) errors.height = "invalidHeight";
    }
  }
  for (const [k, v] of [["displayName", displayName], ["occupation", occupation], ["educationDetail", educationDetail], ["about", about], ["familyInfo", familyInfo]] as const) {
    if (v && containsContactInfo(v)) errors[k] = "contactInfo";
  }
  if (Object.keys(errors).length) return { errors, fields };

  await exec(
    `UPDATE profiles SET display_name=?, created_by=?, marital_status=?, height_cm=?, education_level=?, education_detail=?,
            occupation=?, about=?, family_info=?, onboarding_step=GREATEST(onboarding_step,1) WHERE user_id=?`,
    [displayName, createdBy, maritalStatus, heightCm, educationLevel, educationDetail || null, occupation, about, familyInfo || null, user.id],
  );
  await after(mode, "/onboarding/location");
  return { ok: true, notice: "saved" };
}

/* ------------------------------------------------------------------- step 2 */

export async function saveLocationAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const mode = str(fd, "mode") === "onboarding" ? "onboarding" : "edit";
  const fields = echo(fd, ["divisionId", "districtId", "upazilaId"]);
  const sel = await validateLocation({ divisionId: num(fields.divisionId!), districtId: num(fields.districtId!), upazilaId: num(fields.upazilaId!) });
  if (!sel) return { formError: "locationMismatch", fields };
  const errors: Record<string, string> = {};
  if (!sel.divisionId) errors.divisionId = "required";
  if (!sel.districtId) errors.districtId = "required";
  if (Object.keys(errors).length) return { errors, fields };
  await exec("UPDATE profiles SET division_id=?, district_id=?, upazila_id=?, onboarding_step=GREATEST(onboarding_step,2) WHERE user_id=?", [
    sel.divisionId,
    sel.districtId,
    sel.upazilaId,
    user.id,
  ]);
  await after(mode, "/onboarding/photo");
  return { ok: true, notice: "saved" };
}

/* ------------------------------------------------------------------- photos */

export async function uploadPhotoAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const mode = str(fd, "mode") === "onboarding" ? "onboarding" : "edit";
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return { errors: { photo: "required" } };
  if (file.size > appConfig.photoMaxBytes) return { errors: { photo: "photoTooLarge" } };
  const rl = await hit(RULES.photo, `user:${user.id}`);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes } };
  const profile = await getOwnProfile(user.id);
  if (!profile) return { formError: "generic" };
  const res = await savePhoto(profile.id, Buffer.from(await file.arrayBuffer()));
  if (!res.ok) {
    const map = { tooLarge: "photoTooLarge", type: "photoType", tooSmall: "photoTooSmall", invalid: "photoType" } as const;
    return { errors: { photo: map[res.error] } };
  }
  await exec("UPDATE profiles SET onboarding_step=GREATEST(onboarding_step,3) WHERE user_id=?", [user.id]);
  await after(mode, "/onboarding/preferences");
  return { ok: true, notice: "photoSaved" };
}

export async function deletePhotoAction(): Promise<FormState> {
  const user = await actionUser();
  const profile = await getOwnProfile(user.id);
  if (profile) await deletePhoto(profile.id);
  revalidatePath("/", "layout");
  return { ok: true, notice: "photoDeleted" };
}

export async function setPhotoVisibilityAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const v = str(fd, "photoVisibility");
  if (!isOneOf(PHOTO_VISIBILITY, v)) return { errors: { photoVisibility: "required" } };
  await exec("UPDATE profiles SET photo_visibility=? WHERE user_id=?", [v, user.id]);
  revalidatePath("/", "layout");
  return { ok: true, notice: "saved" };
}

export async function skipPhotoAction(): Promise<void> {
  const user = await actionUser();
  await exec("UPDATE profiles SET onboarding_step=GREATEST(onboarding_step,3) WHERE user_id=?", [user.id]);
  redirect({ href: "/onboarding/preferences", locale: await getLocale() });
}

/* -------------------------------------------------------------- preferences */

export async function savePreferencesAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const mode = str(fd, "mode") === "onboarding" ? "onboarding" : "edit";
  const fields = echo(fd, ["ageMin", "ageMax", "divisionId", "districtId", "upazilaId"]);
  const ageMin = num(fields.ageMin!);
  const ageMax = num(fields.ageMax!);
  if (ageMin === null || ageMax === null || ageMin < appConfig.searchAgeMinBound || ageMax > appConfig.searchAgeMaxBound) return { errors: { ageMin: "invalidAgeRange" }, fields };
  if (ageMin > ageMax) return { errors: { ageMin: "invalidAgeRange" }, fields };
  const sel = await validateLocation({ divisionId: num(fields.divisionId!), districtId: num(fields.districtId!), upazilaId: num(fields.upazilaId!) });
  if (!sel) return { formError: "locationMismatch", fields };
  await exec(
    `INSERT INTO partner_preferences (user_id, age_min, age_max, division_id, district_id, upazila_id) VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE age_min=VALUES(age_min), age_max=VALUES(age_max), division_id=VALUES(division_id), district_id=VALUES(district_id), upazila_id=VALUES(upazila_id)`,
    [user.id, ageMin, ageMax, sel.divisionId, sel.districtId, sel.upazilaId],
  );
  await exec("UPDATE profiles SET onboarding_step=GREATEST(onboarding_step,4) WHERE user_id=?", [user.id]);
  await after(mode, "/onboarding/review");
  return { ok: true, notice: "saved" };
}

/* ---------------------------------------------------------- publish / hide */

export async function publishProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const res = await publishProfile(user.id);
  if (!res.ok) {
    if ("suspended" in res) return { formError: "notAvailable" };
    return { formError: "profileIncomplete", values: { missing: res.missing.join(",") } };
  }
  revalidatePath("/", "layout");
  const dest = str(fd, "from") === "onboarding" ? "/search?welcome=1" : "/dashboard/profile?published=1";
  redirect({ href: dest, locale: await getLocale() });
  return { ok: true };
}

export async function hideProfileAction(): Promise<FormState> {
  const user = await actionUser();
  await hideProfile(user.id);
  revalidatePath("/", "layout");
  return { ok: true, notice: "hidden" };
}

