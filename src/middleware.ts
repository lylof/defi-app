import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Vérifier si la session a expiré
    if (token?.error === "SessionExpired") {
      return NextResponse.redirect(new URL("/login?expired=true", req.url));
    }
    
    // Protection des routes admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Autoriser même si token.error existe pour pouvoir gérer l'expiration dans le middleware
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/profile", "/dashboard", "/challenges/:path*"],
}; 