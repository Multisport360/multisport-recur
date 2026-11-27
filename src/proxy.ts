import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before the signed-in parts of the site.
 *  1. Refreshes the Supabase session cookie so it does not expire mid-visit.
 *  2. Sends signed-out visitors to the sign-in page, and signed-in visitors away from it.
 *
 * This is a convenience, not the security boundary. Row-level security in the database
 * and the checks in each page are what keep one family's data from another.
 */

const SIGNED_OUT_ONLY = ["/login", "/signup"];
const SIGN_IN_PATH = "/login";
const HOME_WHEN_SIGNED_IN = "/athletes";

function isSignedOutOnly(pathname: string): boolean {
  return SIGNED_OUT_ONLY.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isAuthPlumbing(pathname: string): boolean {
  return pathname.startsWith("/auth/");
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without Supabase settings there is no session to check. The pages report the missing keys.
  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Do not put code between creating the client and this call: it is what refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (isAuthPlumbing(pathname)) return response;

  if (isSignedIn && isSignedOutOnly(pathname)) {
    return redirectKeepingCookies(request, response, HOME_WHEN_SIGNED_IN);
  }

  if (!isSignedIn && !isSignedOutOnly(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = SIGN_IN_PATH;
    signIn.search = "";
    signIn.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return redirectKeepingCookies(request, response, signIn.toString());
  }

  return response;
}

/** A redirect that still carries any refreshed session cookies. */
function redirectKeepingCookies(request: NextRequest, from: NextResponse, to: string): NextResponse {
  const redirect = NextResponse.redirect(new URL(to, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Only the signed-in parts of the site and the sign-in pages. The public home page is not touched.
  matcher: [
    "/login/:path*",
    "/signup/:path*",
    "/auth/:path*",
    "/athletes/:path*",
    "/consent/:path*",
    "/account/:path*",
    "/plan/:path*",
  ],
};
