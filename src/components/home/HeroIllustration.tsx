export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 560"
      className="w-full h-full"
      role="img"
      aria-label="दिव्य आभा के साथ मंदिर का चित्रण"
    >
      <defs>
        <radialGradient id="auraGlow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#F7D8A3" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#C89B3C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C89B3C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="templeGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9B566" />
          <stop offset="100%" stopColor="#9C7726" />
        </linearGradient>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9F0" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFF9F0" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <circle cx="280" cy="235" r="230" fill="url(#auraGlow)" />

      {/* concentric mala rings */}
      <circle cx="280" cy="235" r="170" fill="none" stroke="#C89B3C" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="280" cy="235" r="135" fill="none" stroke="#C89B3C" strokeOpacity="0.35" strokeWidth="1" />

      {/* lotus base */}
      <g opacity="0.9">
        <path d="M180 430 Q280 470 380 430 Q380 460 280 480 Q180 460 180 430Z" fill="url(#templeGold)" />
        {[...Array(7)].map((_, i) => {
          const angle = -90 + (i - 3) * 20;
          const rad = (angle * Math.PI) / 180;
          const x = 280 + Math.cos(rad) * 90;
          const y = 430 + Math.sin(rad) * 28;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="26"
              ry="40"
              fill="#F7D8A3"
              fillOpacity={0.55 + (i % 2) * 0.15}
              transform={`rotate(${angle + 90} ${x} ${y})`}
            />
          );
        })}
      </g>

      {/* temple spire (shikhara) — abstract, non-figurative */}
      <g>
        <polygon points="280,70 230,260 330,260" fill="url(#templeGold)" />
        <polygon points="280,100 245,250 315,250" fill="#FFF9F0" fillOpacity="0.18" />
        <rect x="255" y="250" width="50" height="90" fill="url(#templeGold)" />
        <rect x="225" y="335" width="110" height="22" rx="4" fill="url(#templeGold)" />
        <circle cx="280" cy="58" r="10" fill="#F7D8A3" />
        {[1, 2, 3].map((i) => (
          <rect
            key={i}
            x={270 - i * 4}
            y={70 + i * 58}
            width={20 + i * 8}
            height="6"
            fill="#FFF9F0"
            fillOpacity="0.25"
          />
        ))}
      </g>

      <rect x="0" y="430" width="560" height="130" fill="url(#skyFade)" />
    </svg>
  );
}
