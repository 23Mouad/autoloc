import nodemailer from "nodemailer";

// ── Transport ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Autoloc Team <mouadev3@gmail.com>";

// ── Brand colours ──────────────────────────────────────────────────────────
const ACCENT = "#f59e0b";
const BG     = "#0f172a";
const CARD   = "#1e293b";
const TEXT   = "#e2e8f0";
const MUTED  = "#94a3b8";

// ── Base layout ────────────────────────────────────────────────────────────
function html(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;color:${TEXT};">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:${CARD};border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:28px 36px;border-bottom:2px solid ${ACCENT};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:800;color:${ACCENT};letter-spacing:-0.5px;">AutoLoc</span>
                  <span style="font-size:22px;font-weight:400;color:${TEXT};"> Annaba</span>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">location de voitures</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 36px 28px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0f172a;padding:20px 36px;border-top:1px solid #334155;">
            <p style="margin:0;font-size:11px;color:${MUTED};text-align:center;">
              © ${new Date().getFullYear()} AutoLoc Annaba · 12 Rue Larbi Ben M'hidi, Annaba 23000<br/>
              <a href="mailto:mouadev3@gmail.com" style="color:${ACCENT};text-decoration:none;">mouadev3@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="tel:+21338421567" style="color:${ACCENT};text-decoration:none;">+213 38 42 15 67</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function h2(text: string) {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${TEXT};">${text}</h2>`;
}
function p(text: string, style = "") {
  return `<p style="margin:0 0 12px;font-size:15px;color:${MUTED};line-height:1.6;${style}">${text}</p>`;
}
function btn(text: string, href: string) {
  return `<a href="${href}" style="display:inline-block;margin:8px 4px;padding:12px 28px;background:${ACCENT};color:#0f172a;font-weight:700;font-size:15px;border-radius:8px;text-decoration:none;">${text}</a>`;
}
function badge(label: string, color = ACCENT) {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:99px;background:${color}20;color:${color};font-size:12px;font-weight:600;border:1px solid ${color}40;">${label}</span>`;
}
function divider() {
  return `<hr style="border:none;border-top:1px solid #334155;margin:20px 0;" />`;
}
function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:${MUTED};width:40%;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:${TEXT};font-weight:600;">${value}</td>
  </tr>`;
}
function infoTable(rows: [string, string][]) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;margin:16px 0;border:1px solid #334155;">
    ${rows.map(([l, v]) => infoRow(l, v)).join("")}
  </table>`;
}
function otpBox(otp: string) {
  return `<div style="text-align:center;margin:24px 0;">
    <div style="display:inline-block;background:#0f172a;border:2px solid ${ACCENT};border-radius:14px;padding:20px 36px;">
      <p style="margin:0 0 6px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:2px;">Code de vérification</p>
      <p style="margin:0;font-size:40px;font-weight:800;color:${ACCENT};letter-spacing:12px;font-family:monospace;">${otp}</p>
    </div>
    <p style="margin:10px 0 0;font-size:12px;color:${MUTED};">Ce code expire dans <strong style="color:${TEXT};">10 minutes</strong></p>
  </div>`;
}

// ============================================================
//  EMAIL SENDERS
// ============================================================

/** 1. OTP Verification */
export async function sendOtpEmail(to: string, name: string, otp: string) {
  const body = `
    ${h2("Vérification de votre email")}
    ${p(`Bonjour <strong style="color:${TEXT};">${name}</strong>, merci de vous être inscrit sur AutoLoc Annaba.`)}
    ${p("Utilisez le code ci-dessous pour vérifier votre adresse email :")}
    ${otpBox(otp)}
    ${p("Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.")}
  `;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "🔐 Vérification de votre email – AutoLoc Annaba",
    html: html("Vérification email", body),
  });
}

/** 2. Welcome email (after verification) */
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const roleLabel = role === "renter" ? "Partenaire Loueur" : "Client";
  const body = `
    ${h2(`Bienvenue chez AutoLoc Annaba ! 🎉`)}
    ${p(`Bonjour <strong style="color:${TEXT};">${name}</strong>,`)}
    ${p(`Votre compte ${badge(roleLabel)} est maintenant actif. Vous pouvez dès maintenant profiter de tous nos services.`)}
    ${divider()}
    ${p("Que souhaitez-vous faire ?", "color:" + TEXT)}
    ${btn("Parcourir les voitures", "http://localhost:3000/cars")}
    ${role === "renter" ? btn("Mon tableau de bord", "http://localhost:3000/account/dashboard") : ""}
    ${divider()}
    ${p("Besoin d'aide ? Notre équipe est disponible 7j/7.")}
  `;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "🎉 Bienvenue sur AutoLoc Annaba !",
    html: html("Bienvenue", body),
  });
}

/** 3. Booking confirmation (to customer) */
export async function sendBookingConfirmationEmail(opts: {
  to: string;
  fullName: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  totalPrice: number;
  bookingId: string;
}) {
  const body = `
    ${h2("Votre réservation est confirmée ✅")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.fullName}</strong>,`)}
    ${p("Votre réservation a bien été enregistrée. Voici le récapitulatif :")}
    ${infoTable([
      ["Véhicule", opts.carName],
      ["Date de prise en charge", opts.pickupDate],
      ["Date de retour", opts.returnDate],
      ["Lieu de prise en charge", opts.pickupLocation],
      ["Prix total", `${opts.totalPrice.toLocaleString("fr-DZ")} DZD`],
      ["Référence", `#${opts.bookingId.slice(-6).toUpperCase()}`],
    ])}
    ${divider()}
    ${p("Notre équipe vous contactera pour confirmer les détails.")}
    ${btn("Voir ma réservation", `http://localhost:3000/account/bookings`)}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: `✅ Réservation confirmée – ${opts.carName} | AutoLoc Annaba`,
    html: html("Réservation confirmée", body),
  });
}

/** 4. Booking status update (to customer) */
export async function sendBookingStatusEmail(opts: {
  to: string;
  fullName: string;
  carName: string;
  status: "confirmed" | "cancelled";
  bookingId: string;
}) {
  const isConfirmed = opts.status === "confirmed";
  const statusLabel = isConfirmed ? "Approuvée ✅" : "Annulée ❌";
  const emoji = isConfirmed ? "✅" : "❌";
  const body = `
    ${h2(`Mise à jour de votre réservation ${emoji}`)}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.fullName}</strong>,`)}
    ${p(`Le statut de votre réservation pour <strong style="color:${TEXT};">${opts.carName}</strong> a été mis à jour :`)}
    ${infoTable([
      ["Véhicule", opts.carName],
      ["Nouveau statut", statusLabel],
      ["Référence", `#${opts.bookingId.slice(-6).toUpperCase()}`],
    ])}
    ${isConfirmed
      ? p("Votre réservation est approuvée. Préparez-vous pour votre voyage !")
      : p("Si vous pensez qu'il s'agit d'une erreur, contactez-nous.")}
    ${btn("Voir mes réservations", "http://localhost:3000/account/bookings")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: `${emoji} Réservation ${isConfirmed ? "approuvée" : "annulée"} – AutoLoc Annaba`,
    html: html(`Réservation ${statusLabel}`, body),
  });
}

/** 5. New booking alert to admin */
export async function sendAdminNewBookingEmail(opts: {
  adminEmail: string;
  fullName: string;
  email: string;
  phone: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  bookingId: string;
}) {
  const body = `
    ${h2("🔔 Nouvelle réservation reçue")}
    ${p("Une nouvelle demande de réservation vient d'être soumise.")}
    ${infoTable([
      ["Client", opts.fullName],
      ["Email", opts.email],
      ["Téléphone", opts.phone],
      ["Véhicule", opts.carName],
      ["Du", opts.pickupDate],
      ["Au", opts.returnDate],
      ["Prix total", `${opts.totalPrice.toLocaleString("fr-DZ")} DZD`],
      ["Référence", `#${opts.bookingId.slice(-6).toUpperCase()}`],
    ])}
    ${btn("Gérer les réservations", "http://localhost:3000/admin/bookings")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.adminEmail,
    subject: `🔔 Nouvelle réservation – ${opts.carName} | AutoLoc`,
    html: html("Nouvelle réservation", body),
  });
}

/** 6. Contact form – forwarded to admin */
export async function sendContactEmail(opts: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const body = `
    ${h2("📬 Nouveau message de contact")}
    ${infoTable([
      ["Nom", opts.fullName],
      ["Email", opts.email],
      ["Téléphone", opts.phone || "—"],
      ["Sujet", opts.subject],
    ])}
    ${divider()}
    <div style="background:#0f172a;border-radius:10px;border:1px solid #334155;padding:16px 20px;margin:8px 0;">
      <p style="margin:0 0 6px;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Message</p>
      <p style="margin:0;font-size:14px;color:${TEXT};line-height:1.7;">${opts.message.replace(/\n/g, "<br/>")}</p>
    </div>
    ${btn("Répondre", `mailto:${opts.email}`)}
  `;
  await transporter.sendMail({
    from: FROM,
    to: process.env.SMTP_USER!,
    replyTo: opts.email,
    subject: `📬 Contact – ${opts.subject} | ${opts.fullName}`,
    html: html("Message de contact", body),
  });
}

/** 7. Contact form – auto-reply to sender */
export async function sendContactAutoReply(opts: { to: string; fullName: string; subject: string }) {
  const body = `
    ${h2("Merci pour votre message ! 📩")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.fullName}</strong>,`)}
    ${p(`Nous avons bien reçu votre message concernant <strong style="color:${TEXT};">"${opts.subject}"</strong>.`)}
    ${p("Notre équipe vous répondra dans les plus brefs délais (généralement sous 24h).")}
    ${divider()}
    ${p("En attendant, vous pouvez :")}
    ${btn("Voir nos voitures", "http://localhost:3000/cars")}
    ${btn("WhatsApp", "https://wa.me/213770123456")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "📩 Nous avons bien reçu votre message – AutoLoc Annaba",
    html: html("Message reçu", body),
  });
}

/** 8. Partner request received – confirm to applicant */
export async function sendPartnerRequestReceived(opts: {
  to: string;
  name: string;
  companyName: string;
  requestId: string;
}) {
  const body = `
    ${h2("Demande de partenariat reçue 🤝")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.name}</strong>,`)}
    ${p(`Nous avons bien reçu votre demande de partenariat pour <strong style="color:${TEXT};">${opts.companyName}</strong>.`)}
    ${infoTable([
      ["Référence demande", `#${opts.requestId.slice(-8).toUpperCase()}`],
      ["Statut", "En attente de validation"],
    ])}
    ${p("Notre équipe examinera votre dossier et vous contactera sous 48h ouvrables.")}
    ${divider()}
    ${p("Des questions ? Contactez-nous :")}
    ${btn("Nous contacter", "http://localhost:3000/contact")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "🤝 Demande de partenariat reçue – AutoLoc Annaba",
    html: html("Demande de partenariat", body),
  });
}

/** 9. New partner request alert to admin */
export async function sendAdminPartnerRequestEmail(opts: {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  wilaya: string;
  fleetSize: number;
  message?: string;
  requestId: string;
  acceptUrl: string;
  rejectUrl: string;
}) {
  const body = `
    ${h2("🤝 Nouvelle demande de partenariat")}
    ${p("Un loueur souhaite rejoindre la plateforme AutoLoc Annaba.")}
    ${infoTable([
      ["Nom", opts.name],
      ["Email", opts.email],
      ["Téléphone", opts.phone],
      ["Société / Nom commercial", opts.companyName],
      ["Wilaya", opts.wilaya],
      ["Taille de flotte", `${opts.fleetSize} véhicule(s)`],
      ["Référence", `#${opts.requestId.slice(-8).toUpperCase()}`],
    ])}
    ${opts.message ? `${divider()}<div style="background:#0f172a;border-radius:10px;border:1px solid #334155;padding:16px 20px;"><p style="margin:0 0 6px;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Message</p><p style="margin:0;font-size:14px;color:${TEXT};line-height:1.7;">${opts.message}</p></div>` : ""}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="center">${btn("✅ Accepter", opts.acceptUrl)}</td>
      <td align="center"><a href="${opts.rejectUrl}" style="display:inline-block;margin:8px 4px;padding:12px 28px;background:#ef4444;color:#fff;font-weight:700;font-size:15px;border-radius:8px;text-decoration:none;">❌ Refuser</a></td>
    </tr></table>
    ${btn("Voir le tableau de bord", "http://localhost:3000/admin")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: process.env.SMTP_USER!,
    subject: `🤝 Nouveau partenaire – ${opts.companyName} | AutoLoc`,
    html: html("Demande partenariat", body),
  });
}

/** 10. Partner request accepted */
export async function sendPartnerAcceptedEmail(opts: {
  to: string;
  name: string;
  companyName: string;
}) {
  const body = `
    ${h2("Félicitations ! Votre partenariat est approuvé 🎉")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.name}</strong>,`)}
    ${p(`Nous avons le plaisir de vous informer que la demande de partenariat de <strong style="color:${TEXT};">${opts.companyName}</strong> a été <strong style="color:#22c55e;">approuvée</strong>.`)}
    ${divider()}
    ${p("Vous pouvez maintenant vous connecter à votre tableau de bord et commencer à ajouter vos véhicules !")}
    ${btn("Accéder à mon espace", "http://localhost:3000/account/dashboard")}
    ${divider()}
    ${p("Besoin d'aide pour démarrer ? Notre équipe est là pour vous accompagner.")}
    ${btn("Nous contacter", "http://localhost:3000/contact")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "🎉 Partenariat approuvé – AutoLoc Annaba",
    html: html("Partenariat approuvé", body),
  });
}

/** 11. Partner request rejected */
export async function sendPartnerRejectedEmail(opts: {
  to: string;
  name: string;
  companyName: string;
  reason?: string;
}) {
  const body = `
    ${h2("Demande de partenariat – Décision")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.name}</strong>,`)}
    ${p(`Après examen de votre demande de partenariat pour <strong style="color:${TEXT};">${opts.companyName}</strong>, nous ne sommes malheureusement pas en mesure de l'accepter pour le moment.`)}
    ${opts.reason ? infoTable([["Motif", opts.reason]]) : ""}
    ${divider()}
    ${p("Vous pouvez soumettre une nouvelle demande ultérieurement ou nous contacter pour plus d'informations.")}
    ${btn("Nous contacter", "http://localhost:3000/contact")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "📋 Décision sur votre demande de partenariat – AutoLoc Annaba",
    html: html("Demande de partenariat", body),
  });
}

/** 12. Password reset */
export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const body = `
    ${h2("Réinitialisation de votre mot de passe 🔑")}
    ${p(`Bonjour <strong style="color:${TEXT};">${opts.name}</strong>,`)}
    ${p("Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :")}
    <div style="text-align:center;margin:24px 0;">
      ${btn("Réinitialiser mon mot de passe", opts.resetUrl)}
    </div>
    ${p("Ce lien expire dans <strong style=\"color:" + TEXT + ";\">1 heure</strong>.", "color:" + MUTED)}
    ${divider()}
    ${p("Si vous n'avez pas fait cette demande, ignorez cet email.")}
  `;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "🔑 Réinitialisation mot de passe – AutoLoc Annaba",
    html: html("Réinitialisation mot de passe", body),
  });
}
