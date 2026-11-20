import "server-only";
import { cmToFeetInches } from "@/lib/profile-options";
import type { OwnProfile } from "@/server/services/profiles";
import type { AboutInitial } from "@/components/features/profile-forms";

export function aboutInitial(p: OwnProfile): AboutInitial {
  const h = p.heightCm ? cmToFeetInches(p.heightCm) : null;
  return {
    displayName: p.displayName,
    createdBy: p.createdBy,
    maritalStatus: p.maritalStatus ?? "",
    heightFeet: h ? String(h.feet) : "",
    heightInches: h ? String(h.inches) : "",
    educationLevel: p.educationLevel ?? "",
    educationDetail: p.educationDetail ?? "",
    occupation: p.occupation ?? "",
    about: p.about ?? "",
    familyInfo: p.familyInfo ?? "",
  };
}
