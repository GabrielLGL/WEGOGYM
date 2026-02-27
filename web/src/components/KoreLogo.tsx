interface KoreLogoProps {
  size?: number;
  className?: string;
  gradientId?: string;
}

export default function KoreLogo({ size = 50, className = "", gradientId = "koreGrad" }: KoreLogoProps) {
  return (
    <svg
      className={`animate-[pulseLogo_3s_infinite_ease-in-out] ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6c5ce7" />
          <stop offset="100%" stopColor="#00cec9" />
        </linearGradient>
        <filter id={`${gradientId}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke={`url(#${gradientId})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        filter={`url(#${gradientId}-glow)`}
      >
        <line x1="30" y1="20" x2="30" y2="80" />
        <line x1="30" y1="50" x2="70" y2="20" />
        <line x1="30" y1="50" x2="70" y2="80" />
      </g>
      <g fill="var(--bg)" stroke={`url(#${gradientId})`} strokeWidth="3">
        <circle cx="30" cy="20" r="6" />
        <circle cx="30" cy="80" r="6" />
        <circle cx="30" cy="50" r="8" />
        <circle cx="70" cy="20" r="6" />
        <circle cx="70" cy="80" r="6" />
      </g>
    </svg>
  );
}
