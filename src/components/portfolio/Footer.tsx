import { profile } from "@/data/profile";
import { links } from "@/data/links";

const quickLinks = [
  { name: "home", href: "#home" },
  { name: "about", href: "#about" },
  { name: "skills", href: "#skills" },
  { name: "projects", href: "#projects" },
  { name: "experience", href: "#experience" },
  { name: "contact", href: "#contact" },
];

const connectLinks = [
  { name: "github", url: links.github },
  { name: "linkedin", url: links.linkedin },
  { name: "leetcode", url: links.leetcode },
  { name: "codeforces", url: links.codeforces },
  { name: "codechef", url: links.codechef },
  { name: "gfg", url: links.gfg },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-20 border-t border-[var(--phosphor)]/40 bg-card/40 font-mono">
      {/* Top status strip */}
      <div className="border-b border-[var(--phosphor)]/25 bg-[var(--phosphor)]/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--phosphor)] shadow-[0_0_6px_var(--phosphor)]" />
            <span className="phosphor-glow">conn</span>
            <span className="opacity-60">established</span>
          </span>
          <span className="opacity-40">|</span>
          <span><span className="opacity-60">host</span> <span className="text-foreground/85">vivek.os</span></span>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="hidden sm:inline"><span className="opacity-60">shell</span> <span className="text-foreground/85">bash-6.2</span></span>
          <span className="opacity-40 hidden md:inline">|</span>
          <span className="hidden md:inline"><span className="opacity-60">uptime</span> <span className="text-foreground/85">graduating 2028</span></span>
          <span className="ml-auto hidden opacity-70 lg:inline">press <kbd className="border border-[var(--phosphor)]/40 px-1">`</kbd> to open shell</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Prompt heading */}
        <div className="mb-6 text-[12px] text-muted-foreground">
          <span className="phosphor-glow">guest@vivek</span>
          <span className="opacity-60">:</span>
          <span className="opacity-70">~/portfolio</span>
          <span className="phosphor-glow">$ </span>
          <span className="text-foreground/90">tree --footer</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_1.2fr]">
          {/* Identity block */}
          <div className="border border-[var(--phosphor)]/40 bg-background/50 p-4">
            <div className="flex items-center gap-2 border-b border-[var(--phosphor)]/25 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 bg-[var(--phosphor)] shadow-[0_0_6px_var(--phosphor)]" />
              <span>whoami.log</span>
            </div>
            <div className="mt-3 font-display text-xl text-foreground">
              <span className="phosphor-glow">&gt;</span> {profile.name}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <span className="phosphor-glow">// </span>
              Building toward Software Engineer.
            </p>
            <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">CSE-DS</span>
              <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">RNSIT</span>
              <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">2024→28</span>
            </div>
          </div>

          {/* nav */}
          <div className="min-w-0">
            <FooterColHeader label="./nav" />
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {quickLinks.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    className="group flex items-center gap-2 text-foreground/80 transition-colors hover:text-[var(--phosphor)]"
                  >
                    <span className="text-[var(--phosphor)] opacity-40 group-hover:opacity-100">▸</span>
                    <span className="group-hover:underline">{l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* connect */}
          <div className="min-w-0">
            <FooterColHeader label="./connect" />
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {connectLinks.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-foreground/80 transition-colors hover:text-[var(--phosphor)]"
                  >
                    <span className="text-[var(--phosphor)] opacity-40 group-hover:opacity-100">$</span>
                    <span className="truncate group-hover:underline">open {l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="min-w-0">
            <FooterColHeader label="./contact" />
            <ul className="mt-3 space-y-2 text-[12px]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[var(--phosphor)]">@</span>
                <a href={`mailto:${profile.email}`} className="break-all text-foreground/85 hover:text-[var(--phosphor)] hover:underline">
                  {profile.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[var(--phosphor)]">#</span>
                <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="text-foreground/85 hover:text-[var(--phosphor)] hover:underline">
                  {profile.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[var(--phosphor)]">~</span>
                <span className="text-foreground/85">{profile.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="mt-8 overflow-hidden border border-[var(--phosphor)]/30 bg-background/60">
          <div className="flex w-max gap-8 whitespace-nowrap py-2 text-[11px] text-muted-foreground [animation:footer-ticker_40s_linear_infinite]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex shrink-0 items-center gap-8 pl-8">
                <span><span className="text-[var(--phosphor)]">$</span> git log --oneline</span>
                <span className="opacity-70">e4a1b · feat: consistency v3</span>
                <span className="opacity-40">•</span>
                <span className="opacity-70">c9f22 · perf: ascii portrait sampler</span>
                <span className="opacity-40">•</span>
                <span className="opacity-70">8d0e1 · style: phosphor CRT theme</span>
                <span className="opacity-40">•</span>
                <span className="opacity-70">a12ff · docs: readme polish</span>
                <span className="opacity-40">•</span>
                <span><span className="text-[var(--phosphor)]">$</span> uptime →</span>
                <span className="opacity-70">graduating 2028 · open_to_work=true</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--phosphor)]/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-4 text-[11px] text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="phosphor-glow">$</span>
            <span>echo &quot;© {year} {profile.name}&quot;</span>
            <span className="term-cursor" />
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">built.with</span>
            <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">react</span>
            <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">ts</span>
            <span className="border border-[var(--phosphor)]/40 px-1.5 py-0.5 text-[var(--phosphor)]">tailwind</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footer-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}

function FooterColHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-dashed border-[var(--phosphor)]/40 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-[var(--phosphor)]">┌─</span>
      <span>{label}</span>
      <span className="ml-auto text-[var(--phosphor)]/60">─┐</span>
    </div>
  );
}
