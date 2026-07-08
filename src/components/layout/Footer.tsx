"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { YoutubeIcon, InstagramIcon, FacebookIcon, WhatsappIcon } from "@/components/shared/SocialIcons";
import { NAV_LINKS, SITE, SOCIAL_LINKS } from "@/lib/constants";
import NewsletterForm from "@/components/shared/NewsletterForm";
import MalaDivider from "@/components/shared/MalaDivider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { t } from "@/lib/i18n/strings";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="theme-fixed-dark bg-charcoal text-warm-white/90 mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-8">
        <MalaDivider beadCount={35} className="mb-12 opacity-70" />

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display-hi text-2xl text-gold">कर्मनॉक्सबैक</p>
            <p className="mt-3 font-hindi text-sm text-warm-white/60 leading-relaxed">
              {SITE.tagline}
            </p>
            <p className="mt-3 font-hindi text-sm text-warm-white/50 leading-relaxed">
              {lang === "en" ? t("footer_tagline", "en") : "आत्मा की शुद्धि और परम शांति की ओर — प्रमाणिक जैन जाप, मंत्र व ज्ञान।"}
            </p>
          </div>

          <div>
            <p className="font-hindi text-sm font-semibold text-gold-soft mb-4">
              {lang === "en" ? t("footer_quick_links", "en") : "त्वरित लिंक"}
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-hindi text-sm text-warm-white/70 hover:text-gold transition-colors"
                  >
                    {lang === "en" ? l.label : l.labelHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-hindi text-sm font-semibold text-gold-soft mb-4">
              {lang === "en" ? t("footer_connect", "en") : "संपर्क करें"}
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2 font-sans text-sm text-warm-white/70 hover:text-gold transition-colors"
            >
              <Mail size={16} /> {SITE.email}
            </a>
            <div className="mt-4 flex gap-3">
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full border border-gold/30 p-2.5 hover:bg-gold/10 transition-colors"
              >
                <YoutubeIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-gold/30 p-2.5 hover:bg-gold/10 transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-gold/30 p-2.5 hover:bg-gold/10 transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="rounded-full border border-gold/30 p-2.5 hover:bg-gold/10 transition-colors"
              >
                <WhatsappIcon size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="font-hindi text-sm font-semibold text-gold-soft mb-4">
              {lang === "en" ? "Daily Jaap Reminder" : "दैनिक जाप रिमाइंडर"}
            </p>
            <p className="font-hindi text-sm text-warm-white/60 mb-4">
              {lang === "en"
                ? "Add your email and receive a daily jaap & mantra reminder."
                : "अपना ईमेल जोड़ें और रोज़ाना जाप व मंत्र की याद पाएं।"}
            </p>
            <NewsletterForm dark />
          </div>
        </div>

        <div className="mt-12 border-t border-warm-white/10 pt-6 text-center font-sans text-xs text-warm-white/40">
          © {new Date().getFullYear()} {SITE.name}. {lang === "en" ? t("footer_rights", "en") : "सर्वाधिकार सुरक्षित।"}
        </div>
      </div>
      <div className="border-t border-gray-200 mt-6 pt-4 pb-2 text-center flex flex-wrap justify-center gap-4">
    <a href="/terms" className="font-sans text-xs text-gray-400 hover:text-amber-600">Terms & Conditions</a>
    <a href="/privacy" className="font-sans text-xs text-gray-400 hover:text-amber-600">Privacy Policy</a>
    <span className="font-sans text-xs text-gray-300">|</span>
    <span className="font-sans text-xs text-gray-400">© 2026 KarmaKnocksBack</span>
  </div>
</footer>
  );
}
