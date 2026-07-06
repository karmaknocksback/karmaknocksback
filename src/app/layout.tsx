import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { jsonLdScript, organizationSchema } from "@/lib/seo";
import ThemeInit from "@/components/shared/ThemeInit";
import LanguageInit from "@/components/shared/LanguageInit";
import LanguageGate from "@/components/shared/LanguageGate";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
      className="h-full antialiased"
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
