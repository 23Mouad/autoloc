"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Eye, Gem, Heart } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-DZ")}
      {suffix}
    </span>
  );
}

const team = [
  { name: "Karim Messaoud", initials: "KM", roleKey: "founder" as const },
  { name: "Sara Boudjelal", initials: "SB", roleKey: "reservations" as const },
  { name: "Amine Hadjadj", initials: "AH", roleKey: "mechanic" as const },
];

const teamRoles: Record<string, Record<string, string>> = {
  en: { founder: "Founder & Director", reservations: "Reservations Manager", mechanic: "Chief Mechanic" },
  fr: { founder: "Fondateur & Directeur", reservations: "Responsable des réservations", mechanic: "Chef mécanicien" },
  ar: { founder: "المؤسس والمدير", reservations: "مسؤولة الحجوزات", mechanic: "رئيس الميكانيكيين" },
};

const teamBios: Record<string, Record<string, string>> = {
  en: {
    founder: "Passionate about automobiles, Karim founded AutoLoc in 2019 to offer a premium service to the people of Annaba.",
    reservations: "Sara manages all your reservations efficiently and with a smile. She is your first point of contact.",
    mechanic: "Amine ensures every vehicle is in perfect condition before every rental. Your safety is his priority.",
  },
  fr: {
    founder: "Passionné d'automobile, Karim a fondé AutoLoc en 2019 pour offrir un service premium aux Annabis.",
    reservations: "Sara gère toutes vos réservations avec efficacité et un sourire. Elle est votre premier point de contact.",
    mechanic: "Amine veille à ce que chaque véhicule soit en parfait état avant chaque location. Votre sécurité est sa priorité.",
  },
  ar: {
    founder: "شغوف بالسيارات، أسس كريم أوتولوك في 2019 لتقديم خدمة متميزة لسكان عنابة.",
    reservations: "تدير سارة جميع حجوزاتكم بكفاءة وبابتسامة. هي نقطة اتصالكم الأولى.",
    mechanic: "يحرص أمين على أن تكون كل مركبة في حالة مثالية قبل كل تأجير. سلامتكم أولويته.",
  },
};

export default function AboutPage() {
  const { t, locale } = useI18n();

  const stats = [
    { label: t.about_stat_vehicles, value: 20, suffix: "+" },
    { label: t.about_stat_clients, value: 1200, suffix: "+" },
    { label: t.about_stat_years, value: 5, suffix: "" },
    { label: t.about_stat_zones, value: 6, suffix: "" },
  ];

  const values = [
    { icon: Eye, title: t.about_val1_title, text: t.about_val1_text },
    { icon: Gem, title: t.about_val2_title, text: t.about_val2_text },
    { icon: Heart, title: t.about_val3_title, text: t.about_val3_text },
  ];

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-elevated to-bg-primary" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(193,233,48,0.4) 0%, transparent 60%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl mb-4">
            {t.about_hero_heading.split("Annaba")[0]}
            <span className="text-accent">Annaba</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t.about_hero_sub}
          </p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="accent-underline mb-6">{t.about_story_title}</h2>
              <p className="text-text-secondary leading-relaxed mb-4">{t.about_story}</p>
              <p className="text-text-secondary leading-relaxed">{t.about_story_p2}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="aspect-[4/3] bg-bg-secondary rounded-xl border border-border overflow-hidden">
                <div
                  className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-primary"
                  style={{
                    backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(193,233,48,0.15) 0%, transparent 50%)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-16 md:py-20 bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-accent mb-1" style={{ fontFamily: "var(--font-space)" }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-text-secondary text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="mb-4">{t.about_team_title}</h2>
            <p className="text-text-secondary">{t.about_team_subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-bg-secondary rounded-xl border border-border p-6 text-center hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent font-bold text-lg">{member.initials}</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-0.5">{member.name}</h3>
                <p className="text-accent text-xs font-medium uppercase tracking-wider mb-3">
                  {teamRoles[locale]?.[member.roleKey] || teamRoles.en[member.roleKey]}
                </p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {teamBios[locale]?.[member.roleKey] || teamBios.en[member.roleKey]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="mb-4">{t.about_values_title}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full border border-accent/30 flex items-center justify-center mx-auto mb-4 text-accent">
                  <val.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{val.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{val.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
