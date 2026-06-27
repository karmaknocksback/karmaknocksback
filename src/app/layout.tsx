import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Manrope,
  Tiro_Devanagari_Hindi,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { jsonLdScript, organizationSchema } from "@/lib/seo";
import ThemeInit from "@/components/shared/ThemeInit";
import LanguageInit from "@/components/shared/LanguageInit";
import LanguageGate from "@/components/shared/LanguageGate";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-serif",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-body",
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: ["400"],
  variable: "--font-hindi-display-serif",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hindi-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | जैन जाप, मंत्र और स्वाध्याय`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Jain jap",
    "Jain mantra",
    "Navgrah shanti jap",
    "Jain mrityunjay mantra",
    "Navkar mantra",
    "Jain swadhyay",
    "Digambar jain mantra",
    "Jain spiritual healing",
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "hi_IN",
    type: "website",
    images: [{ url: "/images/logo.png", width: 1024, height: 1536, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: ["/images/logo.png"],
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${cormorant.variable} ${manrope.variable} ${tiroDevanagari.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        <LanguageInit />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema())}
        />
        <LanguageProvider>
          <LanguageGate />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
