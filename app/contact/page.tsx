"use client";

import { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const MarkerDyn = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!fullName.trim()) errs.fullName = "Required";
    if (!email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!subject) errs.subject = "Required";
    if (!message.trim()) errs.message = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Failed to send message. Please try again.");
        return;
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setErrors({});
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl mb-3">
            {t.contact_title}
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            {t.contact_subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left — Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-6">AutoLoc Annaba</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                <p className="text-text-secondary text-sm">
                  12 Rue Larbi Ben M&apos;hidi, Centre-Ville, Annaba 23000
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <div className="text-sm">
                  <a href="tel:+21338421567" className="text-text-secondary hover:text-accent transition-colors block">
                    +213 38 42 15 67
                  </a>
                  <a href="tel:+213770123456" className="text-text-secondary hover:text-accent transition-colors block">
                    +213 770 123 456
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <a href="mailto:mouadev3@gmail.com" className="text-text-secondary hover:text-accent transition-colors text-sm">
                  mouadev3@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                <div className="text-text-secondary text-sm">
                  <p>{t.contact_hours_weekday}</p>
                  <p>{t.contact_hours_weekend}</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mb-8">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/213770123456" aria-label="WhatsApp" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>

            {/* Mini Map */}
            <div className="rounded-xl overflow-hidden border border-border mb-6 h-48">
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
              <MapContainer
                center={[36.9042, 7.7668]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                <MarkerDyn position={[36.9042, 7.7668]} />
              </MapContainer>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/213770123456"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle size={18} />
              {t.contact_whatsapp}
            </a>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-xl border border-border p-6 md:p-8" noValidate>
              <h2 className="text-xl font-semibold mb-6">{t.contact_form_title}</h2>

              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="contact-name" className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                  {t.contact_name} *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                    errors.fullName ? "border-danger" : "border-border focus:border-accent"
                  }`}
                />
                {errors.fullName && <p className="text-danger text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="contact-email" className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                  {t.contact_email} *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                    errors.email ? "border-danger" : "border-border focus:border-accent"
                  }`}
                />
                {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label htmlFor="contact-phone" className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                  {t.contact_phone}
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                  placeholder="+213 xxx xxx xxx"
                />
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label htmlFor="contact-subject" className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                  {t.contact_subject} *
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors ${
                    errors.subject ? "border-danger" : "border-border focus:border-accent"
                  }`}
                >
                  <option value="">—</option>
                  <option value="Réservation">Réservation</option>
                  <option value="Information">Information</option>
                  <option value="Réclamation">Réclamation</option>
                  <option value="Partenariat">Partenariat</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.subject && <p className="text-danger text-xs mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div className="mb-6">
                <label htmlFor="contact-message" className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">
                  {t.contact_message} *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full bg-bg-elevated border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none transition-colors resize-none ${
                    errors.message ? "border-danger" : "border-border focus:border-accent"
                  }`}
                />
                {errors.message && <p className="text-danger text-xs mt-1">{errors.message}</p>}
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    {t.contact_send}
                  </>
                )}
              </button>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 justify-center mt-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm"
                >
                  <CheckCircle size={16} />
                  Message envoyé ! Vous recevrez une confirmation par email.
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
