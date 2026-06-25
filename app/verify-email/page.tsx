"use client";

import { Suspense, useState, useRef, KeyboardEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"" | "customer" | "pending_approval">("");
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code invalide. Veuillez réessayer.");
        return;
      }

      if (data.status === "pending_approval") {
        // Car owner — account needs admin review
        setSuccess("pending_approval");
      } else {
        // Regular customer — email verified, redirect to home so they can log in
        setSuccess("customer");
        setTimeout(() => router.push("/"), 2500);
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec de l'envoi.");
      } else {
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setResending(false);
    }
  };

  if (success === "pending_approval") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Email vérifié !</h2>
          <p className="text-text-secondary mb-4">Votre compte propriétaire est en cours de vérification par notre équipe.</p>
          <p className="text-text-muted text-sm">Vous recevrez un email dès que votre compte sera approuvé.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2.5 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all"
          >
            Retour à l&apos;accueil
          </button>
        </motion.div>
      </div>
    );
  }

  if (success === "customer") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Email vérifié !</h2>
          <p className="text-text-secondary">Votre compte est actif. Connectez-vous pour continuer. Redirection...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Vérifiez votre email</h1>
          <p className="text-text-secondary text-sm">
            Nous avons envoyé un code à 6 chiffres à<br />
            <strong className="text-text-primary">{email || "votre adresse email"}</strong>
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-6">
          {/* Email input if missing */}
          {!emailParam && (
            <div className="mb-5">
              <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-bg-elevated text-text-primary focus:outline-none transition-all ${
                  digit ? "border-accent" : "border-border focus:border-accent/60"
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm mb-4">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
            className="w-full py-3 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Vérifier le code"
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-secondary hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
            {cooldown > 0
              ? `Renvoyer le code dans ${cooldown}s`
              : "Renvoyer le code"}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          Vérifiez vos spams si vous ne recevez pas l&apos;email.
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
