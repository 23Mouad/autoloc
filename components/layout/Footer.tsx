"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const categories = ["Economy", "SUV", "Luxury", "Van", "Minibus"];

export default function Footer() {
  const { t } = useI18n();

  const quickLinks = [
    { href: "/", label: t.nav_home },
    { href: "/cars", label: t.nav_cars },
    { href: "/map", label: t.nav_services },
    { href: "/about", label: t.nav_about },
    { href: "/contact", label: t.nav_contact },
  ];

  return (
    <footer className="bg-bg-secondary border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + Tagline */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-lg font-medium tracking-[0.35em] uppercase">
                <span className="text-text-primary">a</span><span className="text-text-primary">u</span><span className="text-text-primary">t</span><span className="text-accent">o</span><span className="text-text-primary">l</span><span className="text-text-primary">o</span><span className="text-accent">c</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-5">{t.footer_tagline}</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"><Facebook size={16} /></a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"><Instagram size={16} /></a>
              <a href="https://wa.me/213770123456" aria-label="WhatsApp" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"><MessageCircle size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">{t.footer_links}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-text-secondary text-sm hover:text-accent transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">{t.footer_cars}</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}><Link href={`/cars?category=${cat}`} className="text-text-secondary text-sm hover:text-accent transition-colors">{cat}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">{t.footer_contact}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>12 Rue Larbi Ben M&apos;hidi, Centre-Ville, Annaba 23000</span>
              </li>
              <li>
                <a href="tel:+21338421567" className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <Phone size={16} className="shrink-0 text-accent" />+213 38 42 15 67
                </a>
              </li>
              <li>
                <a href="mailto:contact@autoloc-annaba.dz" className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <Mail size={16} className="shrink-0 text-accent" />contact@autoloc-annaba.dz
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center">
          <p className="text-text-muted text-xs">© 2025 AutoLoc Annaba. {t.footer_rights}</p>
        </div>
      </div>
    </footer>
  );
}
