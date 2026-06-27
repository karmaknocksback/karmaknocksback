import { YoutubeIcon, InstagramIcon, WhatsappIcon } from "@/components/shared/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/constants";

const CARDS = [
  {
    icon: YoutubeIcon,
    title: "YouTube",
    desc: "नवीनतम जाप व कथा वीडियो",
    cta: "चैनल देखें",
    href: SOCIAL_LINKS.youtube,
    color: "rgba(255,0,0,0.2)",
    border: "rgba(255,80,80,0.2)",
  },
  {
    icon: InstagramIcon,
    title: "Instagram",
    desc: "दैनिक भक्तिमय रील्स व पोस्ट",
    cta: "फॉलो करें",
    href: SOCIAL_LINKS.instagram,
    color: "rgba(200,80,200,0.2)",
    border: "rgba(200,80,200,0.2)",
  },
  {
    icon: WhatsappIcon,
    title: "Community",
    desc: "WhatsApp समूह व चैनल से जुड़ें",
    cta: "जुड़ें",
    href: SOCIAL_LINKS.whatsappChannel,
    color: "rgba(37,211,102,0.2)",
    border: "rgba(37,211,102,0.2)",
  },
];

export default function SocialSection() {
  return (
    <section className="py-16 px-5 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-deep mb-3">
            सोशल मीडिया
          </p>
          <h2 className="font-display-hi text-3xl text-charcoal">हमसे जुड़ें</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARDS.map(({ icon: Icon, title, desc, cta, href, color, border }) => (
            <a
              key={title}
              href={href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${color}, rgba(255,249,240,0.03))`,
                border: `1px solid ${border}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: color, border: `1px solid ${border}` }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-hindi font-semibold text-charcoal">{title}</p>
                <p className="font-hindi text-xs text-charcoal/55 mt-0.5">{desc}</p>
              </div>
              <span className="font-hindi text-xs text-gold-deep group-hover:underline mt-auto">
                {cta} →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
