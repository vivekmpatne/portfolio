import { useEffect, useRef, useState } from "react";
import { Moon, Sun, FileText, Menu, X, Monitor } from "lucide-react";
import { profile } from "@/data/profile";
import { useResumeAvailable } from "@/hooks/use-resume-available";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "achievements", label: "Coding Profiles" },
  { id: "consistency", label: "Consistency" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [mounted, setMounted] = useState(false);
  const resumeUrl = profile.resumeUrl;
  const resumeAvailable = useResumeAvailable();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let wasScrolled = false;
    let lastProgressLabel = -1;
    const onScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled;
        setScrolled(isScrolled);
      }
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const progress = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress / 100})`;
      }
      const progressLabel = progress >= 99.5 ? 100 : Math.round(progress);
      if (progressTextRef.current && progressLabel !== lastProgressLabel) {
        lastProgressLabel = progressLabel;
        progressTextRef.current.textContent = progressLabel === 100
          ? "[ loaded ] 100%"
          : `loading ${progressLabel}%`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);



  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(s.id);
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-border bg-background/75 shadow-nav backdrop-blur-xl"
          : "bg-background/40 backdrop-blur-md"
      }`}
    >
      {/* Scroll progress ribbon — loading-bar style */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2.5px] overflow-hidden bg-[color-mix(in_oklch,var(--phosphor)_15%,transparent)]"
        aria-hidden
      >
        <div
          ref={progressBarRef}
          className="relative h-full w-full origin-left bg-[var(--phosphor)] shadow-[0_0_10px_var(--phosphor)] will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>



      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="flex items-center gap-2 font-mono text-base font-semibold tracking-tight transition-colors hover:text-primary">
          <span className="font-bold text-primary">&gt;_</span>
          <span>Vivek Patne M</span>
        </a>
        <ul className="hidden items-center gap-1 text-sm md:flex">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`relative rounded-md px-3 py-1.5 transition-colors ${
                    isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--phosphor)]" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          {resumeUrl && resumeAvailable && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-card transition-all hover:-translate-y-0.5 hover:border-foreground/40 hover:bg-accent hover:shadow-card-hover sm:inline-flex"
            >
              <FileText className="h-3.5 w-3.5" /> Resume
            </a>
          )}
          <button
            onClick={() => {
              const nextDark = !dark;
              setDark(nextDark);
              document.documentElement.classList.toggle("dark", nextDark);
            }}
            aria-label="Toggle theme"
            className="rounded-md border border-border/70 bg-card p-2 shadow-card transition-colors hover:border-primary/50 hover:bg-accent"
          >
            {!mounted ? (
              <Monitor className="h-4 w-4" />
            ) : dark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-md border border-border bg-card p-2 shadow-card transition-colors hover:bg-accent md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 transition-colors hover:bg-accent ${
                    active === s.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
            {resumeUrl && resumeAvailable && (
              <li>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground transition-colors hover:bg-accent"
                >
                  <FileText className="h-4 w-4" /> Resume
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
