import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("auth_session")?.value;

  // Protected routes: /dashboard and subpaths
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Auth routes: if already has session cookie, redirect away from /auth/signin and /auth/signup
  if (pathname === "/auth/signin" || pathname === "/auth/signup") {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup"],
};
