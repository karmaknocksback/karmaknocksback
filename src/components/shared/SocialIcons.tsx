interface IconProps {
  size?: number;
  className?: string;
}

export function YoutubeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.2L15 12l-4.5 2.8V9.2z" fill="currentColor" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14 8.5h-1.4c-.6 0-1.1.5-1.1 1.1V11h2.3l-.3 2h-2v5h-2.1v-5H8v-2h1.4V9.3c0-1.6 1.3-2.9 2.9-2.9H14v2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsappIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.6c.2-.9 1-1.5 1.6-1 .5.4.9 1.3.7 1.7-.2.5-.7.6-.4 1.1.5.9 1.4 1.7 2.3 2.1.5.2.6-.3 1-.4.4-.2 1.2.4 1.5.9.3.5-.7 1.5-1.5 1.6-1.5.2-3.6-1-4.7-2.4-.8-1-1.7-2.4-.5-3.6z"
        fill="currentColor"
      />
    </svg>
  );
}
