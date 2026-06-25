"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Car,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira",
  "Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda",
  "Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara",
  "Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf",
  "Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  wilaya: string;
  fleetSize: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  wilaya?: string;
  fleetSize?: string;
}

const BENEFITS = [
  { icon: TrendingUp, title: "Visibilité maximale", desc: "Vos véhicules visibles par des milliers de clients à Annaba" },
  { icon: Star, title: "Gestion simplifiée", desc: "Tableau de bord complet pour gérer vos véhicules et réservations" },
  { icon: Shield, title: "Paiements sécurisés", desc: "Transactions sécurisées et reversements rapides" },
];

export default function PartnerRequestPage() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", companyName: "",
    wilaya: "", fleetSize: "", message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Requis";
    if (!form.email.trim()) errs.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalide";
    if (!form.phone.trim()) errs.phone = "Requis";
    if (!form.companyName.trim()) errs.companyName = "Requis";
    if (!form.wilaya) errs.wilaya = "Requis";
    if (!form.fleetSize || isNaN(Number(form.fleetSize)) || Number(form.fleetSize) < 1) {
      errs.fleetSize = "Doit être au moins 1";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/partner-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fleetSize: Number(form.fleetSize) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Une erreur s'est produite. Veuillez réessayer.");
        return;
      }

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", companyName: "", wilaya: "", fleetSize: "", message: "" });
    } catch {
      setApiError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center bg-bg-secondary border border-border rounded-2xl p-10"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Demande envoyée !</h2>
          <p className="text-text-secondary mb-2">
            Votre demande de partenariat a été soumise avec succès.
          </p>
          <p className="text-text-muted text-sm mb-8">
            Vous recevrez un email de confirmation sous peu. Notre équipe vous contactera dans les 48h ouvrables.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-light transition-colors"
          >
            Retour à l&apos;accueil
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Building2 size={14} />
            Devenir Partenaire
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Rejoignez AutoLoc Annaba
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Développez votre activité de location de voitures en rejoignant notre réseau de partenaires. 
            Soumettez votre demande et notre équipe vous contactera rapidement.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-bg-secondary border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <b.icon size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">{b.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 md:p-10">
            <h2 className="text-xl font-bold text-text-primary mb-2">Formulaire de partenariat</h2>
            <p className="text-text-secondary text-sm mb-8">
              Remplissez le formulaire ci-dessous. Notre équipe examinera votre candidature et vous répondra sous 48h.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <User size={11} className="inline mr-1" /> Nom complet *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Prénom Nom"
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.name ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <Mail size={11} className="inline mr-1" /> Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="vous@exemple.com"
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.email ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <Phone size={11} className="inline mr-1" /> Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+213 xxx xxx xxx"
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.phone ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <Building2 size={11} className="inline mr-1" /> Nom commercial *
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={set("companyName")}
                    placeholder="Mon Agence Location"
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.companyName ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.companyName && <p className="text-danger text-xs mt-1">{errors.companyName}</p>}
                </div>
              </div>

              {/* Wilaya & Fleet Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <MapPin size={11} className="inline mr-1" /> Wilaya *
                  </label>
                  <select
                    value={form.wilaya}
                    onChange={set("wilaya")}
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.wilaya ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  >
                    <option value="">Sélectionner</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-danger text-xs mt-1">{errors.wilaya}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    <Car size={11} className="inline mr-1" /> Taille de flotte *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.fleetSize}
                    onChange={set("fleetSize")}
                    placeholder="ex. 5"
                    className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                      errors.fleetSize ? "border-danger" : "border-border focus:border-accent"
                    }`}
                  />
                  {errors.fleetSize && <p className="text-danger text-xs mt-1">{errors.fleetSize}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                  <MessageSquare size={11} className="inline mr-1" /> Message (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Décrivez votre activité, vos véhicules, vos besoins..."
                  className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait text-base"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Soumettre ma demande
                  </>
                )}
              </button>

              <p className="text-center text-xs text-text-muted">
                En soumettant ce formulaire, vous acceptez d&apos;être contacté par notre équipe.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
