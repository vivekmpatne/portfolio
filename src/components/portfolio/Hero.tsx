import { ArrowDownRight, ArrowRight, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialIcons } from "./SocialIcons";
import { BrandMark } from "./BrandMark";

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden px-6 pb-14 pt-28 sm:pt-32">
      <div aria-hidden className="hero-stage pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-20 -z-10 h-[520px] w-[520px] rounded-full bg-secondary-accent/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[420px] -z-10 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[110px]" />

      <div className="mx-auto grid min-h-[min(760px,calc(100svh-7rem))] max-w-6xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div className="font-mono text-[11px] uppercase tracking-[.18em] text-muted-foreground">{profile.name}<span className="mx-2 text-primary">/</span>Portfolio 2026</div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[.07] px-3.5 py-2 text-xs font-medium text-foreground/90">
            <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-50"/><span className="relative h-2 w-2 rounded-full bg-primary"/></span>
            Open to software engineering internships
          </div>

          <p className="mb-3 font-mono text-xs uppercase tracking-[.2em] text-secondary-accent">CSE-DS student · Bengaluru, India</p>
          <h1 className="max-w-[780px] font-display text-[clamp(3.75rem,8vw,7.5rem)] font-bold leading-[.91] tracking-[-.075em] text-foreground">
            From problems<br />to <span className="text-gradient">products.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            I study computer science at RNSIT and build across full-stack software, IoT, and algorithmic problem solving.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent-gradient px-5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
              Explore my work <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-card/70 px-5 font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card">
              Get in touch <ArrowDownRight className="h-4 w-4 text-primary" />
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <SocialIcons />
            <span className="hidden h-7 w-px bg-border sm:block" />
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{profile.location}</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] lg:ml-auto">
          <div aria-hidden className="absolute -inset-5 rounded-[2.2rem] border border-secondary-accent/10 rotate-3" />
          <div className="hero-portrait relative overflow-hidden rounded-[1.8rem] border border-secondary-accent/20 bg-card p-2">
            <div className="relative overflow-hidden rounded-[1.35rem] bg-surface">
              <img src={profile.avatar} alt={`${profile.name}, computer science student and software developer`} className="aspect-[4/5] w-full object-cover object-center" fetchPriority="high" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#090d13]/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">Vivek Patne</p>
                  <p className="mt-1 text-sm text-white/70">CSE-DS · RNSIT</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/85 backdrop-blur-md">2028</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-6 hidden rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-card sm:block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current focus</span>
            <p className="mt-1 text-sm font-medium text-foreground">Algorithms <span className="text-primary">×</span> real systems</p>
          </div>
          <span aria-hidden className="absolute -right-3 top-10 h-3 w-3 rounded-full bg-primary hero-status-glow" />
        </div>
      </div>
    </section>
  );
}
