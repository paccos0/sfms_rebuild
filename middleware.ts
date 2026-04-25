import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const adminProtectedRoutes = [
  "/dashboard",
  "/academic-years",
  "/terms",
  "/class-templates",
  "/year-classes",
  "/students",
  "/enrollments",
  "/fees",
  "/payments",
  "/outstanding-fees",
  "/penalties",
  "/reports",
  "/profile"
];

const portalProtectedRoutes = ["/portal/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isAdminProtected = adminProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPortalProtected = portalProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminProtected) {
    if (!session || !["admin", "bursar"].includes(session.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isPortalProtected) {
    if (!session || !["student", "parent"].includes(session.role)) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  if (pathname === "/login" && session) {
    if (["student", "parent"].includes(session.role)) {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/portal" && session) {
    if (["student", "parent"].includes(session.role)) {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/portal/:path*",
    "/login"
  ]
};