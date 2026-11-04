import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { links } from "@/data/links";
import { BrandMark } from "./BrandMark";

const navigation = [
  ["About", "#about"], ["Toolkit", "#skills"], ["Projects", "#projects"],
  ["Activity", "#activity"], ["Contact", "#contact"],
] as const;
const socials = [["GitHub", links.github], ["LinkedIn", links.linkedin], ["LeetCode", links.leetcode]] as const;

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href="#home" className="inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground"><BrandMark className="h-9 w-9" />{profile.name}</a>
          <p className="mt-3 text-sm text-muted-foreground">CSE-DS student at RNSIT · Bengaluru, India</p>
          <a href={`mailto:${profile.email}`} className="mt-1 inline-block text-sm text-primary transition-colors hover:text-foreground">{profile.email}</a>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
          {navigation.map(([label, href]) => <a key={label} href={href} className="transition-colors hover:text-foreground">{label}</a>)}
          {socials.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-primary">{label}<ArrowUpRight className="h-3.5 w-3.5" /></a>)}
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href="#home" className="transition-colors hover:text-primary">Back to top ↑</a>
      </div>
    </footer>
  );
}
