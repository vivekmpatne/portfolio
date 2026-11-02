import { profile } from "@/data/profile";
import { links } from "@/data/links";

const navigation = [
  ["Home", "#home"], ["About", "#about"], ["Skills", "#skills"], ["Projects", "#projects"],
  ["Experience", "#experience"], ["Coding Profiles", "#consistency"], ["Consistency", "#consistency"], ["Contact", "#contact"],
] as const;
const socials = [["GitHub", links.github], ["LeetCode", links.leetcode], ["Codeforces", links.codeforces], ["LinkedIn", links.linkedin], ["CodeChef", links.codechef], ["GeeksforGeeks", links.gfg]] as const;

export function Footer() {
  return <footer className="mt-20 border-t border-border bg-card/60 px-6 py-14 text-foreground backdrop-blur-md">
    <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div><a href="#home" className="text-xl font-bold tracking-tight">{profile.name}</a><p className="mt-2 text-sm text-muted-foreground">CSE-DS @ RNSIT · {profile.location}</p><a href={`mailto:${profile.email}`} className="mt-2 block text-sm text-muted-foreground transition-colors hover:text-foreground">{profile.email}</a><span className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">● Available for SDE Roles &amp; Internships</span></div>
      <div><h2 className="text-sm font-semibold">Quick navigation</h2><ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground">{navigation.map(([name, href]) => <li key={name}><a href={href} className="transition-colors hover:text-foreground">{name}</a></li>)}</ul></div>
      <div><h2 className="text-sm font-semibold">Coding &amp; social</h2><div className="mt-4 flex flex-wrap gap-2">{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{name}</a>)}</div></div>
      <div className="rounded-xl border border-border bg-background/70 p-4"><h2 className="font-semibold">Interactive Shell</h2><p className="mt-2 text-sm text-muted-foreground">Explore projects and stats via keyboard commands.</p><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("shell:open"))} className="mt-4 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">⌘ Open Console</button></div>
    </div>
    <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 {profile.name}. All rights reserved.</span><span>Designed with Figma precision · Powered by TanStack Start</span><a href="#home" className="transition-colors hover:text-foreground">Back to top ↑</a></div>
  </footer>;
}
