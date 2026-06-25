"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Token invalide ou manquant.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur s'est produite.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <h2 className="text-2xl font-bold text-text-primary mb-2">Mot de passe mis à jour !</h2>
          <p className="text-text-secondary">Vous pouvez maintenant vous connecter. Redirection...</p>
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
            <Lock size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Nouveau mot de passe</h1>
          <p className="text-text-secondary text-sm">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe *
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[8, 12, 16].map((len, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= len
                          ? i === 0 ? "bg-red-400" : i === 1 ? "bg-yellow-400" : "bg-green-400"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  {password.length < 8 ? "Trop court" : password.length < 12 ? "Faible" : password.length < 16 ? "Moyen" : "Fort"}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
