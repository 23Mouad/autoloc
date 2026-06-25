"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard, Car, CalendarCheck, Users, ChevronLeft, Megaphone,
  Building2, MessageSquare, UserCheck, CreditCard, Bell, LogOut, Shield,
} from "lucide-react";

interface NavItem {
  href:    string;
  label:   string;
  icon:    any;
  badge?:  number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router                    = useRouter();
  const pathname                  = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPending] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    else if (status === "authenticated" && (session?.user as Record<string, unknown>)?.role !== "admin") router.push("/");
  }, [status, session, router]);

  // Fetch pending approvals count for badge
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/users?role=renter&status=pending_approval")
      .then(r => r.json())
      .then(d => setPending(d.total ?? 0))
      .catch(() => {});
  }, [status]);

  const navItems: NavItem[] = [
    { href: "/admin",              label: "Dashboard",         icon: LayoutDashboard },
    { href: "/admin/users",        label: "Utilisateurs",      icon: Users           },
    { href: "/admin/car-owners",   label: "Propriétaires",     icon: UserCheck,  badge: pendingCount },
    { href: "/admin/cars",         label: "Voitures",          icon: Car             },
    { href: "/admin/subscriptions",label: "Abonnements",       icon: CreditCard      },
    { href: "/admin/bookings",     label: "Réservations",      icon: CalendarCheck   },
    { href: "/admin/notifications",label: "Notifications",     icon: Bell            },
    { href: "/admin/announcements",label: "Annonces",          icon: Megaphone       },
    { href: "/admin/partner-requests", label: "Partenariats",  icon: Building2       },
    { href: "/admin/contact-messages", label: "Messages",      icon: MessageSquare   },
  ];

  const user = session?.user as Record<string, unknown> | undefined;

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== "authenticated" || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen pt-16 md:pt-20 flex bg-bg-primary">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-bg-secondary transition-all duration-300 hidden md:flex flex-col shrink-0`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-accent" />
              <h2 className="text-sm font-bold text-accent uppercase tracking-wider">Admin Panel</h2>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-colors ml-auto"
          >
            <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-all relative group ${
                  isActive
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {item.badge && item.badge > 0 && (
                  <span className={`flex items-center justify-center rounded-full text-[10px] font-bold bg-yellow-500 text-black ${
                    collapsed ? "absolute -top-1 -right-1 w-4 h-4" : "w-5 h-5 shrink-0"
                  }`}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-elevated mb-2">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent">
                  {String(user?.name || "A")[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{String(user?.name || "Admin")}</p>
                <p className="text-[10px] text-text-muted truncate">{String(user?.email || "")}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title={collapsed ? "Déconnexion" : undefined}
            className={`flex items-center gap-2.5 text-text-secondary hover:text-red-400 transition-colors text-sm w-full px-3 py-2 rounded-lg hover:bg-red-500/5 ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={15} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
