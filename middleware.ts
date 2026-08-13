import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// v1 has a single admin role — no multi-role path matrix, no MFA.
// Password reset must work for admins who are NOT logged in — that's the
// whole point of "forgot password" — so these paths bypass the session
// requirement entirely, same as the login page itself.
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isPublicPath = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p));

    if (isPublicPath) {
      if (path.startsWith("/admin/login") && token) return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }

    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        return PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p)) || !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
