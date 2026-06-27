import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import {
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsappIcon,
} from "@/components/shared/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "समुदाय | हमारे साधक समुदाय से जुड़ें",
  description: "WhatsApp समूह, चैनल, YouTube, Instagram व Facebook पर हमारे समुदाय से जुड़ें।",
  alternates: { canonical: "/community" },
};

const CHANNELS = [
  {
    icon: WhatsappIcon,
    title: "WhatsApp समूह",
    desc: "दैनिक जाप रिमाइंडर व चर्चा हेतु हमारे समूह से जुड़ें।",
    cta: "समूह जॉइन करें",
    href: SOCIAL_LINKS.whatsappGroup,
    note: "सक्रिय साधक समुदाय",
  },
  {
    icon: WhatsappIcon,
    title: "WhatsApp चैनल",
    desc: "अपडेट व नए जाप की सूचना सीधे पाएं।",
    cta: "चैनल फॉलो करें",
    href: SOCIAL_LINKS.whatsappChannel,
    note: "तुरंत अपडेट",
  },
  {
    icon: YoutubeIcon,
    title: "YouTube",
    desc: "जाप, कथा व स्वाध्याय वीडियो देखें।",
    cta: "चैनल देखें",
    href: SOCIAL_LINKS.youtube,
    note: "साप्ताहिक नए वीडियो",
  },
  {
    icon: InstagramIcon,
    title: "Instagram",
    desc: "दैनिक भक्तिमय रील्स व पोस्ट।",
    cta: "फॉलो करें",
    href: SOCIAL_LINKS.instagram,
    note: "रोज़ाना भक्ति कंटेंट",
  },
  {
    icon: FacebookIcon,
    title: "Facebook",
    desc: "समुदाय अपडेट व चर्चा यहाँ भी उपलब्ध।",
    cta: "पेज देखें",
    href: SOCIAL_LINKS.facebook,
    note: "समुदाय अपडेट",
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="समुदाय"
        title="हमारे साधक समुदाय से जुड़ें"
        subtitle="जाप, ज्ञान व भक्ति को साझा करने वाले हजारों साधकों का परिवार"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHANNELS.map(({ icon: Icon, title, desc, cta, href, note }) => (
          <GlassCard key={title} glow className="p-6 text-center flex flex-col">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-saffron/50 to-gold/30 text-gold-deep mb-4">
              <Icon size={26} />
            </span>
            <p className="font-display text-lg text-charcoal">{title}</p>
            <p className="font-hindi text-sm text-charcoal/60 mt-1 flex-1">{desc}</p>
            <span className="mt-3 inline-block self-center rounded-full bg-gold/10 px-3 py-1 font-sans text-[11px] text-gold-deep">
              {note}
            </span>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
            >
              {cta}
            </a>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
