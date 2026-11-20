"use server";

import { revalidatePath } from "next/cache";
import { REPORT_REASONS, type ReportReason } from "@/lib/profile-options";
import { cleanText } from "@/lib/validation";
import { actionUser } from "./guard";
import { str, type FormState } from "./types";
import { hit, RULES } from "@/server/rate-limit";
import { acceptInterest, declineInterest, sendInterest, withdrawInterest } from "@/server/services/interests";
import { blockUser, reportUser, toggleSaved, unblockUser } from "@/server/services/safety";
import { getProfileByPublicId } from "@/server/services/profiles";

const refresh = () => revalidatePath("/", "layout");

async function targetUserId(publicId: string): Promise<number | null> {
  const p = await getProfileByPublicId(publicId);
  return p ? p.userId : null;
}

export async function expressInterestAction(publicId: string): Promise<FormState> {
  const user = await actionUser();
  const r = await sendInterest(user.id, user.emailVerified, publicId);
  refresh();
  if (r.ok) return { ok: true, notice: r.autoAccepted ? "connected" : "interestSent" };
  if (r.error === "verifyFirst") return { formError: "verifyFirst" };
  if (r.error === "cooldown") return { formError: "cooldown", values: { date: r.retryAfter ?? "" } };
  return { formError: r.error };
}

export async function acceptInterestAction(interestId: number): Promise<FormState> {
  const user = await actionUser();
  const r = await acceptInterest(user.id, user.emailVerified, interestId);
  refresh();
  return r.ok ? { ok: true, notice: "connected" } : { formError: r.error ?? "notAvailable" };
}

export async function declineInterestAction(interestId: number): Promise<FormState> {
  const user = await actionUser();
  const ok = await declineInterest(user.id, interestId);
  refresh();
  return ok ? { ok: true, notice: "declined" } : { formError: "notAvailable" };
}

export async function withdrawInterestAction(interestId: number): Promise<FormState> {
  const user = await actionUser();
  const ok = await withdrawInterest(user.id, interestId);
  refresh();
  return ok ? { ok: true, notice: "withdrawn" } : { formError: "notAvailable" };
}

export async function toggleSaveAction(publicId: string): Promise<{ saved: boolean } | { error: string }> {
  const user = await actionUser();
  const id = await targetUserId(publicId);
  if (!id || id === user.id) return { error: "notAvailable" };
  const saved = await toggleSaved(user.id, id);
  refresh();
  return { saved };
}

export async function blockAction(publicId: string): Promise<FormState> {
  const user = await actionUser();
  const id = await targetUserId(publicId);
  if (!id || id === user.id) return { formError: "notAvailable" };
  await blockUser(user.id, id);
  refresh();
  return { ok: true, notice: "blocked" };
}

export async function unblockAction(publicId: string): Promise<FormState> {
  const user = await actionUser();
  const id = await targetUserId(publicId);
  if (!id) return { formError: "notAvailable" };
  await unblockUser(user.id, id);
  refresh();
  return { ok: true, notice: "unblocked" };
}

export async function reportAction(publicId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await actionUser();
  const id = await targetUserId(publicId);
  if (!id || id === user.id) return { formError: "notAvailable" };
  const reason = str(fd, "reason");
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) return { errors: { reason: "required" } };
  const details = cleanText(str(fd, "details"), 1000) || null;
  const rl = await hit(RULES.report, `user:${user.id}`);
  if (!rl.allowed) return { formError: "rateLimited", values: { minutes: rl.retryAfterMinutes } };
  const res = await reportUser(user.id, id, reason as ReportReason, details);
  if (res === "exists") return { formError: "reportExists" };
  if (str(fd, "alsoBlock") === "on") await blockUser(user.id, id);
  refresh();
  return { ok: true, notice: "reported" };
}
