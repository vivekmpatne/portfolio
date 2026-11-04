export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vp-mark-gradient" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--foreground)" />
            <stop offset="1" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <rect x=".5" y=".5" width="63" height="63" rx="17" fill="var(--card)" stroke="var(--border)" />
        <path d="M13 15h12l7 24 7-24h12L36 51h-8L13 15Z" fill="url(#vp-mark-gradient)" />
        <rect x="43" y="53" width="10" height="3" rx="1.5" fill="var(--primary)" />
      </svg>
    </span>
  );
}
