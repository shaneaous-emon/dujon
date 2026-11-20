import "server-only";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, type SessionUser } from "./auth/session";

/** Page-level guard: guests are sent to /login?next=… (FR-AUTH-012). */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const locale = await getLocale();
    redirect({ href: { pathname: "/login", query: { next: nextPath } }, locale });
  }
  return user!;
}

export async function redirectIfLoggedIn(to = "/dashboard"): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect({ href: to, locale: await getLocale() });
}
