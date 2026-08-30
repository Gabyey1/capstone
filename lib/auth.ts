import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        console.log("[AUTH] authorize() started");

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing email or password");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        console.log("[AUTH] Looking up user:", email);

        try {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          console.log("[AUTH] Database query completed");
          console.log("[AUTH] User found:", !!user);

          if (!user) {
            console.log("[AUTH] User NOT found");
            return null;
          }

          console.log("[AUTH] User status:", user.status);
          console.log("[AUTH] User role:", user.role);

          if (user.status !== "ACTIVE") {
            console.log("[AUTH] User is not ACTIVE");
            return null;
          }

          console.log("[AUTH] Starting password comparison");

          const passwordIsValid = await compare(
            credentials.password,
            user.passwordHash
          );

          console.log("[AUTH] Password valid:", passwordIsValid);

          if (!passwordIsValid) {
            console.log("[AUTH] Password comparison FAILED");
            return null;
          }

          console.log("[AUTH] Authentication SUCCESS");

          return {
            id: String(user.id),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Authentication error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "HOMEOWNER";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};