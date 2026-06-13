import { profile } from "@/data/profile";
import { links } from "@/data/links";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

const connectLinks = [
  { name: "GitHub", url: links.github },
  { name: "LinkedIn", url: links.linkedin },
  { name: "LeetCode", url: links.leetcode },
  { name: "Codeforces", url: links.codeforces },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="font-display text-xl font-semibold">{profile.name}</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Building toward SDE-1.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-4 inline-block text-sm text-foreground/80 hover:text-foreground hover:underline"
          >
            {profile.email}
          </a>
        </div>

        <div>
          <div className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Quick Links
          </div>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.name}>
                <a
                  href={l.href}
                  className="text-foreground/80 transition-colors hover:text-foreground hover:underline"
                >
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Connect
          </div>
          <ul className="space-y-2 text-sm">
            {connectLinks.map((l) => (
              <li key={l.name}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground/80 transition-colors hover:text-foreground hover:underline"
                >
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} {profile.name}. All rights reserved.</div>
          <div>Built with React, TypeScript &amp; Tailwind CSS</div>
        </div>
      </div>
    </footer>
  );
}
