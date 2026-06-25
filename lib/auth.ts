import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Custom error classes that NextAuth v5 will surface as `result.error` on the client
class EmailNotVerifiedError  extends CredentialsSignin { code = "email_not_verified"; }
class PendingApprovalError   extends CredentialsSignin { code = "pending_approval"; }
class AccountLockedError     extends CredentialsSignin { code = "account_locked"; }
class AccountSuspendedError  extends CredentialsSignin { code = "account_suspended"; }

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({
          email:     (credentials.email as string).toLowerCase(),
          deletedAt: { $exists: false },
        });
        if (!user) return null;

        // Brute-force: check if account is temporarily locked
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new AccountLockedError();
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) {
          // Increment login attempts
          const attempts = (user.loginAttempts || 0) + 1;
          const update: Record<string, unknown> = { loginAttempts: attempts };
          if (attempts >= 5) {
            // Lock for 15 minutes
            update.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await User.updateOne({ _id: user._id }, { $set: update });
          return null;
        }

        // Reset attempts on successful password match
        await User.updateOne(
          { _id: user._id },
          { $set: { loginAttempts: 0 }, $unset: { lockUntil: "" } }
        );

        // Gate: email must be verified
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        // Gate: car owners must be approved
        if (user.role === "renter") {
          if (user.status === "pending_approval") throw new PendingApprovalError();
          if (user.status !== "active" && user.status !== "hidden") throw new AccountSuspendedError();
        }

        // Gate: any suspended account (all roles)
        if (user.status === "suspended") {
          throw new AccountSuspendedError();
        }

        return {
          id:     user._id.toString(),
          email:  user.email,
          name:   `${user.name} ${user.lastName}`,
          role:   user.role,
          status: user.status,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role   = (user as any).role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.id     = (user as any).id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role   = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id     = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
});

/* ── Helpers ──────────────────────────────────────────────────── */

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user as Record<string, unknown>).role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireCarOwner() {
  const session = await requireAuth();
  const user = session.user as Record<string, unknown>;
  if (user.role !== "renter") throw new Error("Forbidden");
  if (user.status !== "active" && user.status !== "hidden") {
    throw new Error("subscription_required");
  }
  return session;
}

export interface AuthUser {
  id:     string;
  email:  string;
  name:   string;
  role:   "admin" | "renter" | "customer";
  status: string;
}

/** Extracts typed user fields from an authenticated session object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sessionUser(session: any): AuthUser {
  return session!.user as AuthUser;
}
