import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const TOKEN_COOKIE_NAME = "terrapulse_token";

const protectedRoutes = ["/dashboard", "/projects", "/map", "/analytics", "/settings"];

const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is trying to access a protected route without a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits login/register
  if (isAuthRoute && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/map/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
