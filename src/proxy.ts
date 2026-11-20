import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);

function hasLocalePrefix(pathname: string, locale: string): boolean {
  return pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);
}

/**
 * Request proxy (Next.js "proxy" convention, formerly middleware).
 * - FR-I18N-001: Bangla default without prefix, no Accept-Language detection.
 * - FR-I18N-003: a remembered English choice (cookie set only by the language
 *   switcher) redirects unprefixed URLs to /en/…
 * Guests are redirected from member areas to the login page.
 */
const MEMBER_PREFIXES = ["/dashboard", "/search", "/profiles", "/onboarding"];

function isMemberPath(pathname: string): boolean {
  const bare = hasLocalePrefix(pathname, "en") ? pathname.slice(3) || "/" : pathname;
  return MEMBER_PREFIXES.some((p) => bare === p || bare.startsWith(`${p}/`));
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Fast gate: guests are sent to /login?next=… (FR-AUTH-012). The presence cookie is not a credential;
  // every member page still verifies the real session on the server.
  if (isMemberPath(pathname) && !request.cookies.get("dujon_in")) {
    const url = request.nextUrl.clone();
    url.pathname = hasLocalePrefix(pathname, "en") ? "/en/login" : "/login";
    url.search = `?next=${encodeURIComponent(pathname.replace(/^\/en(?=\/|$)/, "") + search)}`;
    return NextResponse.redirect(url);
  }
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;

  if (remembered === "en" && !hasLocalePrefix(pathname, "en") && !hasLocalePrefix(pathname, "bn")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  return intlProxy(request);
}

export const config = {
  // Skip API routes, Next.js internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
