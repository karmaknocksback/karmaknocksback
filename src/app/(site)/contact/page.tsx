import type { Metadata } from "next";
import { Mail } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import ContactForm from "@/components/contact/ContactForm";
import GlassCard from "@/components/shared/GlassCard";
import {
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsappIcon,
} from "@/components/shared/SocialIcons";
import { SITE, SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "संपर्क करें | Contact",
  description: "KarmaKnocksBack से संपर्क करें — ईमेल, WhatsApp व सोशल मीडिया के माध्यम से।",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <SectionHeading eyebrow="संपर्क" title="हमसे संपर्क करें" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <ContactForm />

        <GlassCard className="p-6 space-y-5">
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-3 font-sans text-sm text-charcoal/75 hover:text-gold-deep"
          >
            <Mail size={18} /> {SITE.email}
          </a>
          <div>
            <p className="font-hindi text-xs text-charcoal/50 mb-3">सोशल मीडिया</p>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/30 p-2.5"
              >
                <YoutubeIcon size={17} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/30 p-2.5"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/30 p-2.5"
              >
                <FacebookIcon size={17} />
              </a>
              <a
                href={SOCIAL_LINKS.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold/30 p-2.5"
              >
                <WhatsappIcon size={17} />
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
