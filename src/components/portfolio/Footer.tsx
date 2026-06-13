import { profile } from "@/data/profile";
import { links } from "@/data/links";

const footerLinks = [
  { name: "GitHub", url: links.github },
  { name: "LinkedIn", url: links.linkedin },
  { name: "LeetCode", url: links.leetcode },
  { name: "Codeforces", url: links.codeforces },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="font-display text-lg font-semibold">{profile.name}</div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Building toward SDE-1.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Connect
          </div>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((l) => (
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
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Contact
          </div>
          <a
            href={`mailto:${profile.email}`}
            className="text-sm text-foreground/80 hover:text-foreground hover:underline"
          >
            {profile.email}
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} {profile.name}. All rights reserved.</div>
          <div>Built with React + Tailwind CSS</div>
        </div>
      </div>
    </footer>
  );
}
