import { useEffect, useState } from "react";
import { ArrowRight, FileText, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { SocialIcons } from "./SocialIcons";
import { useResumeAvailable } from "@/hooks/use-resume-available";
import { AsciiPortrait } from "./AsciiPortrait";


const ROLES = [
  "Aspiring Software Engineer",
  "Full-Stack Engineer",
  "DSA Grinder",
  "Building in Public",
];

export function Hero() {
  const resumeUrl = profile.resumeUrl;
  const resumeAvailable = useResumeAvailable();

  // Rotating role with typewriter effect
  const [rIndex, setRIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = ROLES[rIndex];
    const delay = deleting ? 40 : 80;
    const timer = setTimeout(() => {
      if (!deleting) {
        const next = full.slice(0, text.length + 1);
        setText(next);
        if (next === full) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = full.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setRIndex((i) => (i + 1) % ROLES.length);
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, rIndex]);

  return (
    <section
      id="home"
      className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28"
    >
      {/* Boot header — cleaner, unique framed status bar */}
      <div className="mb-8 hidden font-mono text-[11px] sm:block">
        <div className="flex items-stretch gap-0 text-muted-foreground">
          <div className="flex items-center gap-2 border border-[var(--phosphor)]/50 bg-[var(--phosphor)]/5 px-3 py-1">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--phosphor)] shadow-[0_0_6px_var(--phosphor)]" />
            <span className="phosphor-glow font-semibold">vivek.os</span>
            <span className="opacity-60">v2.1</span>
            <span className="opacity-50">·</span>
            <span className="opacity-70">tty0</span>
          </div>
          <div className="hidden items-center gap-3 border-y border-r border-[var(--phosphor)]/30 px-3 py-1 md:flex">
            <span><span className="opacity-60">boot</span> <span className="text-[var(--phosphor)]">ok</span></span>
            <span className="opacity-40">|</span>
            <span><span className="opacity-60">shell</span> <span className="text-[var(--phosphor)]">online</span></span>
            <span className="opacity-40">|</span>
            <span><span className="opacity-60">glow</span> <span className="text-[var(--phosphor)]">on</span></span>
            <span className="opacity-40">|</span>
            <span><span className="opacity-60">scan</span> <span className="text-[var(--phosphor)]">on</span></span>
          </div>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12">
        <div className="min-w-0">


      <div className="mt-6 flex items-center gap-2 text-sm">
        <span className="phosphor-glow">guest@vivek</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-muted-foreground">~</span>
        <span className="phosphor-glow">$</span>
        <span className="text-foreground/90">whoami</span>
      </div>

      <h1 className="mt-4 font-display text-6xl leading-none tracking-wide md:text-8xl">
        &gt; <span className="phosphor-glow">{profile.name}</span>_
      </h1>

      <div className="mt-6 flex items-center gap-2 text-lg text-foreground/90 md:text-xl">
        <span className="text-muted-foreground">role:</span>
        <span className="phosphor-glow">{text}</span>
        <span className="term-cursor" />
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        <span className="phosphor-glow">// </span>
        {profile.tagline}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {profile.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--phosphor)] shadow-[0_0_8px_var(--phosphor)]" />
          status: OPEN_TO_WORK
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="opacity-60">uptime:</span> graduating 2028
        </span>
      </div>

      {/* Command hints */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="rounded-none border-[var(--phosphor)]/60 bg-transparent font-mono text-sm text-foreground hover:bg-[var(--phosphor)]/10 hover:text-foreground">
          <a href="#projects">
            ./view_projects <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
        {resumeUrl && resumeAvailable && (
          <Button asChild variant="outline" className="rounded-none border-border bg-transparent font-mono text-sm hover:bg-accent">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download>
              <FileText className="mr-1 h-4 w-4" /> cat resume.pdf
            </a>
          </Button>
        )}
        <Button asChild variant="ghost" className="rounded-none font-mono text-sm">
          <a href="#contact">
            <Mail className="mr-1 h-4 w-4" /> ./contact
          </a>
        </Button>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("term:open", { detail: "help" }))
          }
          className="rounded-none border border-dashed border-[var(--phosphor)]/50 px-3 py-2 font-mono text-sm text-[var(--phosphor)] transition-colors hover:bg-[var(--phosphor)]/10"
        >
          {"> open shell (`)"}
        </button>
      </div>

      <div className="mt-8">
        <SocialIcons />
      </div>

      <div className="mt-10 text-xs text-muted-foreground">
        <span className="phosphor-glow">guest@vivek</span>
        <span>:~$ </span>
        <span className="text-foreground/90">help</span>
        <span className="term-cursor ml-1" />
        <div className="mt-1 opacity-70">
          try:{" "}
          <code className="text-foreground/90">about</code> ·{" "}
          <code className="text-foreground/90">skills</code> ·{" "}
          <code className="text-foreground/90">projects</code> ·{" "}
          <code className="text-foreground/90">open leetcode</code> ·{" "}
          <code className="text-foreground/90">contact</code>
        </div>
      </div>
        </div>

        {/* ASCII portrait column */}
        <div className="relative mx-auto w-full max-w-[380px] md:mx-0 md:w-[320px] lg:w-[380px]">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span><span className="phosphor-glow">$</span> cat ./me.ascii</span>
            <span className="opacity-60">72 × ∞ · phosphor</span>
          </div>
          <div className="relative border border-[var(--phosphor)]/40 bg-background/60 p-3 shadow-card">
            <AsciiPortrait width={72} />
            <div className="mt-2 flex items-center justify-between border-t border-[var(--phosphor)]/25 pt-2 font-mono text-[10px] text-muted-foreground">
              <span>vivek@patne</span>
              <span className="phosphor-glow">[ ONLINE ]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

