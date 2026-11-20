import "server-only";
import { ageFromDobString, dobBoundsForAges } from "@/lib/dates";
import type { CreatedBy, EducationLevel, Gender, MaritalStatus, PhotoVisibility } from "@/lib/profile-options";
import { oppositeGender } from "@/lib/profile-options";
import { appConfig } from "@/config/app";
import { exec, one, rows } from "../db";

export type ProfileStatus = "draft" | "published" | "hidden" | "suspended";

export interface OwnProfile {
  id: number;
  userId: number;
  publicId: string;
  displayName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  createdBy: CreatedBy;
  maritalStatus: MaritalStatus | null;
  heightCm: number | null;
  educationLevel: EducationLevel | null;
  educationDetail: string | null;
  occupation: string | null;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  about: string | null;
  familyInfo: string | null;
  photoVisibility: PhotoVisibility;
  status: ProfileStatus;
  onboardingStep: number;
  publishedAt: Date | null;
  photoPublicId: string | null;
}

interface ProfileRow {
  id: number;
  user_id: number;
  public_id: string;
  display_name: string;
  gender: Gender;
  date_of_birth: string;
  created_by: CreatedBy;
  marital_status: MaritalStatus | null;
  height_cm: number | null;
  education_level: EducationLevel | null;
  education_detail: string | null;
  occupation: string | null;
  division_id: number | null;
  district_id: number | null;
  upazila_id: number | null;
  about: string | null;
  family_info: string | null;
  photo_visibility: PhotoVisibility;
  status: ProfileStatus;
  onboarding_step: number;
  published_at: Date | null;
  photo_public_id: string | null;
}

function map(r: ProfileRow): OwnProfile {
  return {
    id: r.id,
    userId: r.user_id,
    publicId: r.public_id,
    displayName: r.display_name,
    gender: r.gender,
    dateOfBirth: r.date_of_birth,
    age: ageFromDobString(r.date_of_birth),
    createdBy: r.created_by,
    maritalStatus: r.marital_status,
    heightCm: r.height_cm,
    educationLevel: r.education_level,
    educationDetail: r.education_detail,
    occupation: r.occupation,
    divisionId: r.division_id,
    districtId: r.district_id,
    upazilaId: r.upazila_id,
    about: r.about,
    familyInfo: r.family_info,
    photoVisibility: r.photo_visibility,
    status: r.status,
    onboardingStep: r.onboarding_step,
    publishedAt: r.published_at,
    photoPublicId: r.photo_public_id,
  };
}

const SELECT = `SELECT p.*, ph.public_id AS photo_public_id FROM profiles p LEFT JOIN profile_photos ph ON ph.profile_id = p.id`;

export async function getOwnProfile(userId: number): Promise<OwnProfile | null> {
  const r = await one<ProfileRow>(`${SELECT} WHERE p.user_id = ?`, [userId]);
  return r ? map(r) : null;
}

export async function getProfileByPublicId(publicId: string): Promise<OwnProfile | null> {
  const r = await one<ProfileRow>(`${SELECT} WHERE p.public_id = ?`, [publicId]);
  return r ? map(r) : null;
}

export type MissingField = "displayName" | "maritalStatus" | "educationLevel" | "occupation" | "about" | "location";

/** Required fields before publishing (FR-PROF-003). */
export function missingForPublish(p: OwnProfile): MissingField[] {
  const m: MissingField[] = [];
  if (!p.displayName.trim()) m.push("displayName");
  if (!p.maritalStatus) m.push("maritalStatus");
  if (!p.educationLevel) m.push("educationLevel");
  if (!p.occupation?.trim()) m.push("occupation");
  if (!p.about || p.about.trim().length < 30) m.push("about");
  if (!p.divisionId || !p.districtId) m.push("location");
  return m;
}

export interface Preferences {
  ageMin: number;
  ageMax: number;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  saved: boolean;
}

export async function getPreferences(userId: number, ownAge: number): Promise<Preferences> {
  const r = await one<{ age_min: number; age_max: number; division_id: number | null; district_id: number | null; upazila_id: number | null }>(
    "SELECT age_min,age_max,division_id,district_id,upazila_id FROM partner_preferences WHERE user_id=?",
    [userId],
  );
  if (r) return { ageMin: r.age_min, ageMax: r.age_max, divisionId: r.division_id, districtId: r.district_id, upazilaId: r.upazila_id, saved: true };
  const lo = Math.max(appConfig.searchAgeMinBound, ownAge - 5);
  const hi = Math.min(appConfig.searchAgeMaxBound, Math.max(lo, ownAge + 5));
  return { ageMin: lo, ageMax: hi, divisionId: null, districtId: null, upazilaId: null, saved: false };
}

export async function publishProfile(userId: number): Promise<{ ok: true } | { ok: false; missing: MissingField[] } | { ok: false; suspended: true }> {
  const p = await getOwnProfile(userId);
  if (!p) return { ok: false, missing: ["displayName"] };
  if (p.status === "suspended") return { ok: false, suspended: true };
  const missing = missingForPublish(p);
  if (missing.length) return { ok: false, missing };
  await exec("UPDATE profiles SET status='published', published_at=NOW(3), onboarding_step=4 WHERE user_id=?", [userId]);
  return { ok: true };
}

export async function hideProfile(userId: number): Promise<void> {
  await exec("UPDATE profiles SET status='hidden' WHERE user_id=? AND status='published'", [userId]);
}

/* ----------------------------------------------------------------- discovery */

export interface CardData {
  userId: number;
  publicId: string;
  displayName: string;
  age: number;
  createdBy: CreatedBy;
  maritalStatus: MaritalStatus | null;
  educationLevel: EducationLevel | null;
  occupation: string | null;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  photoPublicId: string | null;
  photoVisibility: PhotoVisibility;
  saved: boolean;
  connected: boolean;
}

export interface SearchFilters {
  ageMin: number;
  ageMax: number;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  page: number;
}

export interface SearchResult {
  items: CardData[];
  total: number;
  page: number;
  totalPages: number;
}

interface CardRow {
  user_id: number;
  public_id: string;
  display_name: string;
  date_of_birth: string;
  created_by: CreatedBy;
  marital_status: MaritalStatus | null;
  education_level: EducationLevel | null;
  occupation: string | null;
  division_id: number | null;
  district_id: number | null;
  upazila_id: number | null;
  photo_visibility: PhotoVisibility;
  photo_public_id: string | null;
}

export async function decorateCards(viewerId: number, list: CardRow[]): Promise<CardData[]> {
  if (list.length === 0) return [];
  const ids = list.map((r) => r.user_id);
  const [saved, conns] = await Promise.all([
    rows<{ saved_user_id: number }>("SELECT saved_user_id FROM saved_profiles WHERE user_id=? AND saved_user_id IN (?)", [viewerId, ids]),
    rows<{ other: number }>(
      `SELECT IF(sender_id=?, receiver_id, sender_id) AS other FROM interests
        WHERE status='accepted' AND ((sender_id=? AND receiver_id IN (?)) OR (receiver_id=? AND sender_id IN (?)))`,
      [viewerId, viewerId, ids, viewerId, ids],
    ),
  ]);
  const savedSet = new Set(saved.map((s) => s.saved_user_id));
  const connSet = new Set(conns.map((c) => c.other));
  return list.map((r) => ({
    userId: r.user_id,
    publicId: r.public_id,
    displayName: r.display_name,
    age: ageFromDobString(r.date_of_birth),
    createdBy: r.created_by,
    maritalStatus: r.marital_status,
    educationLevel: r.education_level,
    occupation: r.occupation,
    divisionId: r.division_id,
    districtId: r.district_id,
    upazilaId: r.upazila_id,
    photoPublicId: r.photo_public_id,
    photoVisibility: r.photo_visibility,
    saved: savedSet.has(r.user_id),
    connected: connSet.has(r.user_id),
  }));
}

/** Discovery query (docs/07 §5). Location conditions are added only when present so MySQL can pick the right index. */
export async function searchProfiles(viewerId: number, viewerGender: Gender, f: SearchFilters): Promise<SearchResult> {
  const { dobMax, dobMinExclusive } = dobBoundsForAges(f.ageMin, f.ageMax);
  const where: string[] = [
    "p.status = 'published'",
    "p.gender = ?",
    "p.user_id <> ?",
    "p.date_of_birth <= ?",
    "p.date_of_birth > ?",
    `NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = ? AND b.blocked_id = p.user_id) OR (b.blocker_id = p.user_id AND b.blocked_id = ?))`,
  ];
  const params: (string | number)[] = [oppositeGender(viewerGender), viewerId, dobMax, dobMinExclusive, viewerId, viewerId];
  if (f.upazilaId) { where.push("p.upazila_id = ?"); params.push(f.upazilaId); }
  else if (f.districtId) { where.push("p.district_id = ?"); params.push(f.districtId); }
  else if (f.divisionId) { where.push("p.division_id = ?"); params.push(f.divisionId); }

  const base = `FROM profiles p JOIN users u ON u.id = p.user_id AND u.status = 'active'
                LEFT JOIN profile_photos ph ON ph.profile_id = p.id WHERE ${where.join(" AND ")}`;
  const totalRow = await one<{ c: number }>(`SELECT COUNT(*) AS c ${base}`, params);
  const total = totalRow?.c ?? 0;
  const pageSize = appConfig.searchPageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, f.page), totalPages, appConfig.searchMaxPage);
  const list = await rows<CardRow>(
    `SELECT p.user_id, p.public_id, p.display_name, p.date_of_birth, p.created_by, p.marital_status, p.education_level,
            p.occupation, p.division_id, p.district_id, p.upazila_id, p.photo_visibility, ph.public_id AS photo_public_id
       ${base} ORDER BY p.published_at DESC, p.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  );
  return { items: await decorateCards(viewerId, list), total, page, totalPages };
}

export async function cardsForUserIds(viewerId: number, userIds: number[]): Promise<Map<number, CardData>> {
  if (userIds.length === 0) return new Map();
  const list = await rows<CardRow>(
    `SELECT p.user_id, p.public_id, p.display_name, p.date_of_birth, p.created_by, p.marital_status, p.education_level,
            p.occupation, p.division_id, p.district_id, p.upazila_id, p.photo_visibility, ph.public_id AS photo_public_id
       FROM profiles p LEFT JOIN profile_photos ph ON ph.profile_id = p.id WHERE p.user_id IN (?)`,
    [userIds],
  );
  const cards = await decorateCards(viewerId, list);
  return new Map(cards.map((c) => [c.userId, c]));
}
