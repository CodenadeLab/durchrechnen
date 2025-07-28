import { type NextRequest, NextResponse } from "next/server";

// Define protected and public routes
const protectedRoutes = ["/dashboard", "/settings", "/profile"];
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoute = authRoutes.includes(path);

  // Only check session for routes that need it
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Validate session by calling API
  let hasValidSession = false;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const sessionResponse = await fetch(`${apiUrl}/api/session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      });
      hasValidSession = sessionResponse.ok;
    }
  } catch (error) {
    console.error("Session validation error in middleware:", error);
    hasValidSession = false;
  }

  // Redirect to sign-in if accessing protected route without valid session
  if (isProtectedRoute && !hasValidSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect to dashboard if accessing auth routes with valid session
  if (isAuthRoute && hasValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
