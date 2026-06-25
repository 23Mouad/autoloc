"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  User, CalendarCheck, Car, LayoutDashboard,
  Megaphone, Users,
} from "lucide-react";

const navItems = [
  { href: "/account", label: "Profile", icon: User, roles: ["customer", "renter"] },
  { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["renter"] },
  { href: "/account/bookings", label: "My Bookings", icon: CalendarCheck, roles: ["customer", "renter"] },
  { href: "/account/cars", label: "My Cars", icon: Car, roles: ["renter"] },
  { href: "/account/renters", label: "Active Renters", icon: Users, roles: ["renter"] },
  { href: "/account/announcements", label: "Announcements", icon: Megaphone, roles: ["renter"] },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== "authenticated") return null;

  const userRole = (session?.user as Record<string, unknown>)?.role as string;

  return (
    <div className="min-h-screen pt-16 md:pt-20 flex bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-bg-secondary hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-accent uppercase tracking-wider">My Account</h2>
          <p className="text-xs text-text-muted mt-1">{session?.user?.email}</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
            {userRole}
          </span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
