import { useEffect, useState } from "react";
import { FileText, Menu, Moon, Sun, X } from "lucide-react";
import { profile } from "@/data/profile";
import { useResumeAvailable } from "@/hooks/use-resume-available";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "achievements", label: "Profiles" },
  { id: "consistency", label: "Consistency" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [dark, setDark] = useState(false);
  const resumeUrl = profile.resumeUrl;
  const resumeAvailable = useResumeAvailable();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActive(s.id)),
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "border-border bg-card/80 shadow-nav" : "border-transparent bg-card/50"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[image:var(--gradient-primary)] transition-transform duration-100"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
        <a href="#home" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-green-400/50 bg-[#0a1410] font-mono text-[11px] font-bold tracking-tight text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all duration-300 hover:animate-[terminal-pulse_1.1s_ease-in-out_infinite] hover:border-green-300 hover:text-green-300 motion-reduce:hover:animate-none">
            <span aria-hidden="true">&gt;_</span>
            <span className="sr-only">Terminal</span>
          </span>
          Vivek Patne M
        </a>
        <ul className="hidden items-center gap-0.5 text-sm lg:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  active === s.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {resumeUrl && resumeAvailable && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download aria-label="Open resume" className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-2 text-sm font-semibold text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/20 sm:px-4">
              <FileText className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Resume</span>
            </a>
          )}
          <button
            onClick={() => {
              const d = !dark;
              setDark(d);
              document.documentElement.classList.toggle("dark", d);
            }}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full border border-border bg-card p-2 transition-colors hover:bg-accent"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-full border border-border bg-card p-2 transition-colors hover:bg-accent lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border bg-card/95 p-2 shadow-nav backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-2 font-medium transition-colors ${
                    active === s.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
            {resumeUrl && resumeAvailable && <li>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-primary transition-colors hover:bg-primary/10">
                <FileText className="h-4 w-4" /> Resume
              </a>
            </li>}
          </ul>
        </div>
      )}
    </header>
  );
}
