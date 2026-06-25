"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X, Sun, Moon, Globe, LogIn, UserPlus, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/I18nProvider";
import { useTheme } from "@/lib/ThemeProvider";
import { Locale } from "@/lib/i18n";
import AuthModal from "@/components/auth/AuthModal";
import { useSession, signOut } from "next-auth/react";

const localeLabels: Record<Locale, string> = { en: "EN", fr: "FR", ar: "AR" };
const localeFlags: Record<Locale, string> = { en: "🇬🇧", fr: "🇫🇷", ar: "🇩🇿" };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register-role">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { locale, t, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const userName = session?.user?.name || "";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const links = [
    { href: "/", label: t.nav_home },
    { href: "/cars", label: t.nav_cars },
    { href: "/map", label: t.nav_services },
    { href: "/about", label: t.nav_about },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const navBg =
    scrolled || !isHome
      ? "bg-bg-secondary/95 backdrop-blur-md border-b border-border"
      : "bg-transparent";

  const accountHref = userRole === "admin" ? "/admin" : "/account";

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group" aria-label="AutoLoc Annaba">
              <span className="text-lg font-medium tracking-[0.35em] uppercase">
                <span className="text-text-primary">a</span>
                <span className="text-text-primary">u</span>
                <span className="text-text-primary">t</span>
                <span className="text-accent">o</span>
                <span className="text-text-primary">l</span>
                <span className="text-text-primary">o</span>
                <span className="text-accent">c</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors duration-200 hover:text-text-primary ${
                    pathname === link.href ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right — Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                aria-label={theme === "dark" ? t.theme_light : t.theme_dark}
                title={theme === "dark" ? t.theme_light : t.theme_dark}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-text-secondary text-xs font-medium hover:border-accent hover:text-accent transition-colors"
                  aria-label="Change language"
                >
                  <Globe size={14} />
                  {localeFlags[locale]} {localeLabels[locale]}
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-2 right-0 bg-bg-secondary border border-border rounded-xl overflow-hidden shadow-lg z-50 min-w-[120px]"
                    >
                      {(["en", "fr", "ar"] as Locale[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => { setLocale(l); setLangOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                            locale === l
                              ? "text-accent bg-accent/10"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                          }`}
                        >
                          <span>{localeFlags[l]}</span>
                          <span>{l === "en" ? "English" : l === "fr" ? "Français" : "العربية"}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth: Show account menu when logged in, login/signup when not */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-accent transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent text-xs font-bold">{userInitial}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary max-w-[100px] truncate">{userName}</span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full mt-2 right-0 bg-bg-secondary border border-border rounded-xl overflow-hidden shadow-lg z-50 min-w-[200px]"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                          <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
                            {userRole}
                          </span>
                        </div>

                        <Link
                          href={accountHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        >
                          {userRole === "admin" ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                          {userRole === "admin" ? "Admin Panel" : "My Account"}
                        </Link>

                        {userRole !== "admin" && (
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                          >
                            <User size={16} />
                            Profile
                          </Link>
                        )}

                        <button
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthView("login"); setAuthOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
                  >
                    <LogIn size={15} />
                    {t.auth_login}
                  </button>
                  <button
                    onClick={() => { setAuthView("register-role"); setAuthOpen(true); }}
                    className="px-5 py-2 bg-accent text-bg-primary text-sm font-semibold rounded-full hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t.auth_signup}
                  </button>
                </>
              )}
            </div>

            {/* Mobile — Theme + Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-text-secondary"
                aria-label={theme === "dark" ? t.theme_light : t.theme_dark}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="p-2 text-text-primary"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bg-primary/98 backdrop-blur-lg flex flex-col items-center justify-center md:hidden"
          >
            <div className="flex flex-col items-center gap-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className={`text-2xl font-medium transition-colors ${
                      pathname === link.href ? "text-accent" : "text-text-primary"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile language switcher */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-2 mt-4"
              >
                {(["en", "fr", "ar"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setMobileOpen(false); }}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                      locale === l
                        ? "bg-accent/20 text-accent border-accent/50"
                        : "border-border text-text-secondary"
                    }`}
                  >
                    {localeFlags[l]} {localeLabels[l]}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-3 mt-2 w-full max-w-xs"
              >
                {isLoggedIn ? (
                  <>
                    <Link
                      href={accountHref}
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-full text-base flex items-center justify-center gap-2"
                    >
                      <User size={18} />
                      {userRole === "admin" ? "Admin Panel" : "My Account"}
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full py-3 border border-red-500/30 text-red-400 font-semibold rounded-full text-base flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); setAuthView("login"); setAuthOpen(true); }}
                      className="w-full py-3 border border-border text-text-primary font-semibold rounded-full text-base flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      {t.auth_login}
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); setAuthView("register-role"); setAuthOpen(true); }}
                      className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-full text-base flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} />
                      {t.auth_signup}
                    </button>
                  </>
                )}
              </motion.div>
              <motion.a
                href="tel:+21338421567"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-text-secondary mt-4"
              >
                <Phone size={16} />
                <span>+213 38 42 15 67</span>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialView={authView} />
    </>
  );
}
