/** Original, decorative illustrations. All are hidden from screen readers. */

export function Scene({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice" className={className}>
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dcedfb" /><stop offset="1" stopColor="#f3faf5" /></linearGradient>
      </defs>
      <rect width="800" height="220" fill="url(#sc-sky)" />
      <circle cx="640" cy="72" r="56" fill="#ffe3b3" opacity="0.45" />
      <circle cx="640" cy="72" r="34" fill="#ffd08a" />
      <g fill="#ffffff" opacity="0.95">
        <ellipse cx="470" cy="52" rx="38" ry="12" /><ellipse cx="496" cy="44" rx="24" ry="11" />
        <ellipse cx="742" cy="112" rx="30" ry="9" /><ellipse cx="722" cy="106" rx="18" ry="8" />
      </g>
      <path d="M0 160 C120 100 220 118 330 142 C430 100 520 88 640 132 C700 112 760 116 800 126 V220 H0Z" fill="#cfe9d9" />
      <path d="M0 182 C100 140 200 160 300 170 C420 130 520 160 620 160 C700 144 760 160 800 154 V220 H0Z" fill="#a8d9bc" />
      <path d="M0 206 C150 172 300 198 450 188 C600 178 700 194 800 184 V220 H0Z" fill="#7cc59c" />
      <path d="M392 220 C430 198 474 190 520 176 C562 164 590 152 612 138" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 12" />
      <path d="M612 138 V108" stroke="#1c2b24" strokeWidth="3" strokeLinecap="round" />
      <path d="M612 108 L638 116 L612 125Z" fill="#f08a6b" />
      <g fill="#4f9f78">
        <path d="M250 172 l11 -26 l11 26Z" /><path d="M272 176 l9 -20 l9 20Z" /><path d="M700 160 l10 -24 l10 24Z" /><path d="M560 164 l8 -18 l8 18Z" />
      </g>
    </svg>
  );
}

const SPOTS = {
  book: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-sun)" />
      <path d="M48 34 C38 27 26 27 18 30 V68 C26 65 38 65 48 72Z" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 34 C58 27 70 27 78 30 V68 C70 65 58 65 48 72Z" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 40 h14 M26 48 h14 M56 40 h14" stroke="#a8d9bc" strokeWidth="3" strokeLinecap="round" />
      <path d="M62 58 C62 49 69 46 74 46 C74 54 70 59 62 58Z" fill="#7cc59c" />
    </>
  ),
  compass: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-peach)" />
      <circle cx="48" cy="48" r="27" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" />
      <path d="M58 38 L52 52 L44 44Z" fill="#f08a6b" /><path d="M38 58 L44 44 L52 52Z" fill="#7cc59c" />
      <circle cx="48" cy="48" r="3" fill="#1c2b24" />
      <path d="M48 24 v5 M48 67 v5 M24 48 h5 M67 48 h5" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  summit: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-sky)" />
      <circle cx="68" cy="30" r="8" fill="#ffd08a" />
      <path d="M14 74 L40 32 L58 60 L66 50 L82 74Z" fill="#a8d9bc" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M33 43 L40 32 L47 43 L40 47Z" fill="#ffffff" />
      <path d="M40 32 V18" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" /><path d="M40 18 L54 22 L40 27Z" fill="#f08a6b" />
    </>
  ),
  calendar: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-lilac)" />
      <rect x="22" y="26" width="52" height="48" rx="8" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" />
      <path d="M22 40 H74" stroke="#1c2b24" strokeWidth="2.5" /><path d="M34 20 v10 M62 20 v10" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="36" cy="52" r="4" fill="#f7c900" /><circle cx="48" cy="52" r="4" fill="#a8d9bc" /><circle cx="60" cy="52" r="4" fill="#f58a1f" /><circle cx="36" cy="64" r="4" fill="#a8d9bc" /><circle cx="48" cy="64" r="4" fill="#b9d4f5" />
    </>
  ),
  plant: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-mint)" />
      <path d="M48 58 V34" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 44 C48 32 38 26 28 26 C28 38 36 45 48 44Z" fill="#7cc59c" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 38 C48 28 56 22 66 22 C66 32 59 39 48 38Z" fill="#a8d9bc" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 58 H64 L60 78 H36Z" fill="#f08a6b" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  people: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-sky)" />
      <circle cx="36" cy="38" r="9" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" /><path d="M20 70 C20 56 28 52 36 52 C44 52 52 56 52 70Z" fill="#a8d9bc" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="62" cy="42" r="8" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" /><path d="M50 70 C50 59 56 55 62 55 C68 55 76 59 76 70Z" fill="#f08a6b" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  scales: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-lilac)" />
      <path d="M48 24 V72 M34 72 H62 M24 34 H72" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 52 L24 34 L32 52Z" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" /><path d="M14 52 H34 C34 59 29 62 24 62 C19 62 14 59 14 52Z" fill="#a8d9bc" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M64 52 L72 34 L80 52Z" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" /><path d="M62 52 H82 C82 59 77 62 72 62 C67 62 62 59 62 52Z" fill="#f08a6b" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  chat: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-mint)" />
      <path d="M22 30 H74 a6 6 0 0 1 6 6 V58 a6 6 0 0 1 -6 6 H46 L34 74 V64 H22 a6 6 0 0 1 -6 -6 V36 a6 6 0 0 1 6 -6Z" fill="#ffffff" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 37 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3Z" fill="#ffd08a" stroke="#1c2b24" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  steps: (
    <>
      <circle cx="48" cy="48" r="44" fill="var(--t-peach)" />
      <path d="M20 72 V58 H36 V46 H52 V34 H68 V72Z" fill="#a8d9bc" stroke="#1c2b24" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M68 34 V20" stroke="#1c2b24" strokeWidth="2.5" strokeLinecap="round" /><path d="M68 20 L80 24 L68 28Z" fill="#f08a6b" />
    </>
  ),
} as const;

export function Spot({ name, className = "" }: { name: keyof typeof SPOTS; className?: string }) {
  return <svg aria-hidden viewBox="0 0 96 96" className={className}>{SPOTS[name]}</svg>;
}
