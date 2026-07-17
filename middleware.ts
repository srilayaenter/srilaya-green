import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// v1 has a single admin role — no multi-role path matrix, no MFA.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isLoginPage = path.startsWith("/admin/login");

    if (isLoginPage) {
      if (token) return NextResponse.redirect(new URL("/admin", req.url));
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
        return path.startsWith("/admin/login") || !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
