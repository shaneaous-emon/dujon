/** Abstract, people-free hero illustration (IMG-01 stand-in: illustrative only, no real or implied members). */
export function HeroArt({ label }: { label: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 480 400" className="h-auto w-full max-w-md">
      <defs>
        <linearGradient id="ha-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a2e3b" />
          <stop offset="1" stopColor="#b5586a" />
        </linearGradient>
        <linearGradient id="ha-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a441" />
          <stop offset="1" stopColor="#f2d29b" />
        </linearGradient>
        <radialGradient id="ha-c" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4e4e6" />
          <stop offset="1" stopColor="#fbf8f3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="400" rx="28" fill="#f3eee7" />
      <circle cx="240" cy="200" r="190" fill="url(#ha-c)" />
      <circle cx="190" cy="200" r="104" fill="none" stroke="url(#ha-a)" strokeWidth="14" />
      <circle cx="290" cy="200" r="104" fill="none" stroke="url(#ha-b)" strokeWidth="14" opacity="0.95" />
      <path d="M240 128c-28 22-28 122 0 144 28-22 28-122 0-144z" fill="#7a2e3b" opacity="0.12" />
      <g fill="#7a2e3b">
        <circle cx="76" cy="84" r="5" opacity="0.5" />
        <circle cx="410" cy="318" r="7" opacity="0.35" />
        <circle cx="400" cy="74" r="4" opacity="0.5" />
        <circle cx="84" cy="326" r="6" opacity="0.3" />
      </g>
      <path d="M232 214l-14-13c-10-9-4-24 8-24 6 0 10 3 12 7 2-4 6-7 12-7 12 0 18 15 8 24l-14 13z" fill="#7a2e3b" transform="translate(0 -4)" />
    </svg>
  );
}

/** Soft illustration for the "success stories coming soon" card — no people, no names, no quotes. */
export function BloomArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 100" className="h-20 w-auto">
      <g fill="none" stroke="#7a2e3b" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <path d="M20 90c20-10 30-30 30-60" />
        <path d="M80 90c0-25 6-45 30-60" />
        <path d="M140 90c-20-8-26-26-26-44" />
      </g>
      <g fill="#f4e4e6" stroke="#7a2e3b" strokeWidth="2">
        <circle cx="50" cy="26" r="10" />
        <circle cx="112" cy="26" r="12" />
        <circle cx="114" cy="42" r="8" />
      </g>
    </svg>
  );
}
