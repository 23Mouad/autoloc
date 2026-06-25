"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Store, Car, User, UserPlus, Mail, Lock, Phone, MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";
import { signIn } from "next-auth/react";

type AuthView = "login" | "register-role" | "renter-type" | "register-form";
type Role = "renter" | "customer" | null;

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaia", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'sila", "Mascara", "Ouargla", "Oran",
  "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf",
  "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register-role";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const { t } = useI18n();
  const [view, setView] = useState<AuthView>(initialView);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [storeLocation, setStoreLocation] = useState("");

  // Login form state (separate from register)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const navigateTo = useCallback((newView: AuthView, dir: number = 1) => {
    setDirection(dir);
    setView(newView);
    setError("");
  }, []);

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setView(initialView);
      setRole(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setWilaya("");
      setStoreLocation("");
      setLoginEmail("");
      setLoginPassword("");
      setShowPassword(false);
      setError("");
      setLoading(false);
    }, 300);
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    if (r === "renter") {
      navigateTo("renter-type");
    } else {
      navigateTo("register-form");
    }
  };

  const handleRenterTypeSelect = () => {
    navigateTo("register-form");
  };

  // ── Real login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        handleClose();
        window.location.reload();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Real register ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName,
          lastName,
          email,
          password,
          phone,
          role: role || "customer",
          wilaya,
          storeLocation: role === "renter" ? storeLocation : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Registered, but login failed. Try logging in manually.");
      } else {
        handleClose();
        window.location.reload();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = view === "register-role" ? 1 : view === "renter-type" ? 2 : view === "register-form" ? (role === "renter" ? 3 : 2) : 0;
  const totalSteps = role === "renter" ? 3 : 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md bg-bg-secondary border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div className="flex items-center gap-2">
                {view !== "login" && view !== "register-role" && (
                  <button
                    onClick={() => {
                      if (view === "register-form" && role === "renter") navigateTo("renter-type", -1);
                      else if (view === "register-form" && role === "customer") navigateTo("register-role", -1);
                      else if (view === "renter-type") navigateTo("register-role", -1);
                    }}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                    aria-label={t.auth_back}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {view === "register-role" && (
                  <button
                    onClick={() => navigateTo("login", -1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                    aria-label={t.auth_back}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step indicator */}
            {view !== "login" && (
              <div className="px-6 mb-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider">
                    {t.auth_step} {currentStep} / {totalSteps}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < currentStep ? "bg-accent" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mx-6 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Content — animated slides */}
            <div className="relative overflow-hidden" style={{ minHeight: 360 }}>
              <AnimatePresence mode="wait" custom={direction}>
                {/* ─── LOGIN ─── */}
                {view === "login" && (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="px-6 pb-6 pt-4"
                  >
                    <h2 className="text-xl font-bold text-text-primary mb-1">{t.auth_login_title}</h2>
                    <p className="text-text-secondary text-sm mb-6">{t.auth_login_title}</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                          {t.auth_login_email}
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            placeholder="yourname@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                          {t.auth_login_password}
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="text-right mt-1.5">
                          <button type="button" className="text-xs text-accent hover:underline">{t.auth_login_forgot}</button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {t.auth_login_btn}
                      </button>
                    </form>

                    <div className="text-center mt-5">
                      <span className="text-text-secondary text-sm">{t.auth_no_account} </span>
                      <button onClick={() => navigateTo("register-role")} className="text-accent text-sm font-semibold hover:underline">
                        {t.auth_signup}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── REGISTER: ROLE SELECTION ─── */}
                {view === "register-role" && (
                  <motion.div
                    key="register-role"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="px-6 pb-6 pt-4"
                  >
                    <h2 className="text-xl font-bold text-text-primary mb-1">{t.auth_register_title}</h2>
                    <p className="text-text-secondary text-sm mb-6">{t.auth_register_title}</p>

                    <div className="space-y-3">
                      {/* Renter Card */}
                      <button
                        onClick={() => handleRoleSelect("renter")}
                        className="w-full group text-left p-5 rounded-xl border border-border bg-bg-elevated/50 hover:border-accent hover:bg-accent/5 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                            <Store size={22} className="text-accent" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-text-primary mb-1">{t.auth_role_renter}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{t.auth_role_renter_desc}</p>
                          </div>
                        </div>
                      </button>

                      {/* Customer Card */}
                      <button
                        onClick={() => handleRoleSelect("customer")}
                        className="w-full group text-left p-5 rounded-xl border border-border bg-bg-elevated/50 hover:border-accent hover:bg-accent/5 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                            <User size={22} className="text-accent" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-text-primary mb-1">{t.auth_role_customer}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{t.auth_role_customer_desc}</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="text-center mt-5">
                      <span className="text-text-secondary text-sm">{t.auth_has_account} </span>
                      <button onClick={() => navigateTo("login", -1)} className="text-accent text-sm font-semibold hover:underline">
                        {t.auth_login}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── RENTER TYPE SELECTION ─── */}
                {view === "renter-type" && (
                  <motion.div
                    key="renter-type"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="px-6 pb-6 pt-4"
                  >
                    <h2 className="text-xl font-bold text-text-primary mb-1">{t.auth_renter_type_title}</h2>
                    <p className="text-text-secondary text-sm mb-6">{t.auth_renter_type_title}</p>

                    <div className="space-y-3">
                      {/* Store Official */}
                      <button
                        onClick={handleRenterTypeSelect}
                        className="w-full group text-left p-5 rounded-xl border border-border bg-bg-elevated/50 hover:border-accent hover:bg-accent/5 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                            <Store size={22} className="text-accent" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-text-primary mb-1">{t.auth_renter_store}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">{t.auth_renter_store_desc}</p>
                          </div>
                        </div>
                      </button>

                      {/* Own Car — Coming Soon */}
                      <div className="relative w-full p-5 rounded-xl border border-border bg-bg-elevated/30 opacity-60 cursor-not-allowed overflow-hidden">
                        {/* Coming Soon badge */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent/20 text-accent border border-accent/30">
                          {t.auth_coming_soon}
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0">
                            <Car size={22} className="text-text-muted" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-text-muted mb-1">{t.auth_renter_own}</h3>
                            <p className="text-text-muted text-sm leading-relaxed">{t.auth_renter_own_desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── REGISTRATION FORM ─── */}
                {view === "register-form" && (
                  <motion.div
                    key="register-form"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="px-6 pb-6 pt-4"
                  >
                    <h2 className="text-lg font-bold text-text-primary mb-4">
                      {role === "renter" ? t.auth_role_renter : t.auth_role_customer}
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-3">
                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                            {t.auth_form_firstname}
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                            {t.auth_form_lastname}
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                          {t.auth_form_phone}
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            placeholder="+213 xxx xxx xxx"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                          {t.auth_form_email}
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                          {t.auth_form_password}
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Wilaya */}
                      <div>
                        <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                          {t.auth_form_wilaya}
                        </label>
                        <select
                          value={wilaya}
                          onChange={(e) => setWilaya(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                          required
                        >
                          <option value="">—</option>
                          {wilayas.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>

                      {/* Store Location — only for renters */}
                      {role === "renter" && (
                        <div>
                          <label className="block text-[11px] text-text-secondary font-medium uppercase tracking-wider mb-1">
                            {t.auth_form_store_location}
                          </label>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                              type="text"
                              value={storeLocation}
                              onChange={(e) => setStoreLocation(e.target.value)}
                              className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                              placeholder={t.auth_form_store_placeholder}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        {t.auth_form_register_btn}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
