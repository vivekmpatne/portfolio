import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { BrandMark } from "./BrandMark";

const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Toolkit" },
  { id: "projects", label: "Projects" },
  { id: "activity", label: "Activity" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (!element) continue;
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(section.id)),
        { rootMargin: "-38% 0px -54% 0px", threshold: 0 },
      );
      observer.observe(element);
      observers.push(observer);
    }
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-5">
      <nav className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-3 py-2 backdrop-blur-2xl transition-colors sm:px-4 ${scrolled ? "border-border bg-background/90 shadow-card" : "border-border/70 bg-background/70"}`} aria-label="Main navigation">
        <a href="#home" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-2.5 rounded-full pl-1 text-sm font-semibold tracking-tight text-foreground">
          <BrandMark className="h-8 w-8" /> <span>Vivek <span className="text-muted-foreground">Patne</span></span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-xs transition-colors ${active === section.id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{section.label}</a></li>)}
        </ul>
        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden min-h-10 items-center gap-2 rounded-full bg-accent-gradient px-4 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex">Let’s talk <ArrowUpRight className="h-3.5 w-3.5" /></a>
          <button type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/35 lg:hidden">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </nav>

      {open && <div id="mobile-navigation" className="mx-auto mt-2 max-w-6xl rounded-[1.5rem] border border-border bg-background/95 p-2 shadow-card backdrop-blur-xl lg:hidden">
        <ul className="grid gap-1">
          {sections.map((section) => <li key={section.id}><a href={`#${section.id}`} onClick={() => setOpen(false)} className={`flex min-h-11 items-center rounded-xl px-4 text-sm ${active === section.id ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}>{section.label}</a></li>)}
          <li><a href="#contact" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl bg-accent-gradient px-4 text-sm font-semibold text-primary-foreground">Let’s talk <ArrowUpRight className="ml-2 h-4 w-4" /></a></li>
        </ul>
      </div>}
    </header>
  );
}
