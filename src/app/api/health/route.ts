import { NextResponse } from "next/server";
import { isProduction } from "@/config/app";
import { one } from "@/server/db";

export const dynamic = "force-dynamic";

/** Liveness + DB check. In production it also asserts that no demo rows exist (docs/07 §6.3). */
export async function GET() {
  try {
    await one("SELECT 1 AS ok");
    if (isProduction) {
      const demo = await one<{ c: number }>("SELECT COUNT(*) AS c FROM users WHERE is_demo=1");
      if ((demo?.c ?? 0) > 0) return NextResponse.json({ status: "error", reason: "demo-data-in-production" }, { status: 500 });
    }
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
