import { NextResponse } from "next/server";
import { getLocationTree } from "@/server/locations";

export const dynamic = "force-dynamic";

/** Public reference data (class S0): divisions → districts → upazilas/thanas. */
export async function GET() {
  const tree = await getLocationTree();
  return NextResponse.json(tree, { headers: { "Cache-Control": "public, max-age=3600" } });
}
