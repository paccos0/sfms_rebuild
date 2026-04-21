import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const protectedRoutes = [
  "/dashboard",
  "/academic-years",
  "/terms",
  "/class-templates",
  "/year-classes",
  "/students",
  "/enrollments",
  "/fees",
  "/payments",
  "/penalties",
  "/reports",
  "/profile"
];

const authRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (isProtectedRoute && !session) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/academic-years/:path*",
    "/terms/:path*",
    "/class-templates/:path*",
    "/year-classes/:path*",
    "/students/:path*",
    "/enrollments/:path*",
    "/fees/:path*",
    "/payments/:path*",
    "/penalties/:path*",
    "/reports/:path*",
    "/profile/:path*",
    "/login"
  ]
};
