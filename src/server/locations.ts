import "server-only";
import { rows } from "./db";

export interface Upazila { id: number; districtId: number; nameEn: string; nameBn: string; type: "upazila" | "thana" }
export interface District { id: number; divisionId: number; nameEn: string; nameBn: string }
export interface Division { id: number; nameEn: string; nameBn: string }
export interface LocationTree {
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
}

let cache: { at: number; tree: LocationTree } | null = null;
const TTL = 10 * 60 * 1000;

export async function getLocationTree(): Promise<LocationTree> {
  if (cache && Date.now() - cache.at < TTL) return cache.tree;
  const [d, s, u] = await Promise.all([
    rows<{ id: number; name_en: string; name_bn: string }>("SELECT id,name_en,name_bn FROM divisions ORDER BY name_en"),
    rows<{ id: number; division_id: number; name_en: string; name_bn: string }>("SELECT id,division_id,name_en,name_bn FROM districts ORDER BY name_en"),
    rows<{ id: number; district_id: number; name_en: string; name_bn: string; type: "upazila" | "thana" }>(
      "SELECT id,district_id,name_en,name_bn,type FROM upazilas WHERE is_active=1 ORDER BY name_en",
    ),
  ]);
  const tree: LocationTree = {
    divisions: d.map((x) => ({ id: x.id, nameEn: x.name_en, nameBn: x.name_bn })),
    districts: s.map((x) => ({ id: x.id, divisionId: x.division_id, nameEn: x.name_en, nameBn: x.name_bn })),
    upazilas: u.map((x) => ({ id: x.id, districtId: x.district_id, nameEn: x.name_en, nameBn: x.name_bn, type: x.type })),
  };
  cache = { at: Date.now(), tree };
  return tree;
}

export interface LocationSel {
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
}

/** Validates the division → district → upazila hierarchy (FR-LOC-003). Returns null when inconsistent. */
export async function validateLocation(sel: LocationSel): Promise<LocationSel | null> {
  const tree = await getLocationTree();
  let { divisionId, districtId } = sel;
  const { upazilaId } = sel;
  if (upazilaId !== null) {
    const u = tree.upazilas.find((x) => x.id === upazilaId);
    if (!u) return null;
    if (districtId !== null && districtId !== u.districtId) return null;
    districtId = u.districtId;
  }
  if (districtId !== null) {
    const d = tree.districts.find((x) => x.id === districtId);
    if (!d) return null;
    if (divisionId !== null && divisionId !== d.divisionId) return null;
    divisionId = d.divisionId;
  }
  if (divisionId !== null && !tree.divisions.some((x) => x.id === divisionId)) return null;
  return { divisionId, districtId, upazilaId };
}

export function placeName(tree: LocationTree, locale: "bn" | "en", sel: Partial<LocationSel>): string {
  const pick = (bn: string, en: string) => (locale === "bn" ? bn : en);
  const parts: string[] = [];
  const u = sel.upazilaId ? tree.upazilas.find((x) => x.id === sel.upazilaId) : undefined;
  const d = sel.districtId ? tree.districts.find((x) => x.id === sel.districtId) : undefined;
  const v = sel.divisionId ? tree.divisions.find((x) => x.id === sel.divisionId) : undefined;
  if (u) parts.push(pick(u.nameBn, u.nameEn));
  if (d) parts.push(pick(d.nameBn, d.nameEn));
  if (v) parts.push(pick(v.nameBn, v.nameEn));
  return parts.join(", ");
}
