import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { runDailyMaintenance } from "@/server/services/account";

export const dynamic = "force-dynamic";

/** Daily maintenance (purge deleted accounts, expired rows, mail retries). Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const ok = secret.length >= 16 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return new NextResponse(null, { status: 401 });
  const result = await runDailyMaintenance();
  return NextResponse.json({ status: "ok", result });
}
