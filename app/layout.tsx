import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk, Outfit, Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { I18nProvider } from "@/lib/I18nProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import AuthProvider from "@/components/auth/AuthProvider";

// Fancy display font — for hero headline only
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Clean modern body font
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Headings font
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Arabic font
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoLoc Annaba — Premium Car Rental",
  description:
    "Premium car rental in Annaba, Algeria. 20+ vehicles, free city center delivery. Economy, SUV, Luxury, Van & Minibus.",
  keywords: ["location voiture", "Annaba", "Algérie", "car rental", "AutoLoc"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable} ${spaceGrotesk.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider>
              <Navbar />
              <main id="main-content">{children}</main>
              <Footer />
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
