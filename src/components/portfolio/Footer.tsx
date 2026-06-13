import { profile } from "@/data/profile";
import { links } from "@/data/links";
import { SocialIcons } from "./SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}. Built with React + Tailwind.
        </div>
        <SocialIcons />
        <a
          href={links.portfolioRepo}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Source Code
        </a>
      </div>
    </footer>
  );
}
