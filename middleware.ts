import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Authentication is handled by NextAuth.
    // The authorization rules are defined below.
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/homeowner/:path*",
    "/admin/:path*",
  ],
};