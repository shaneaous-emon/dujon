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
 * Authentication gating is added in Milestone 3.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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
