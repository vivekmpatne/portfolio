import { useEffect, useState } from "react";
import { ArrowRight, FileText, Mail, MapPin, Code2, Users, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { SocialIcons } from "./SocialIcons";
import { useResumeAvailable } from "@/hooks/use-resume-available";

const ROLES = [
  "Aspiring Software Engineer",
  "Full-Stack Engineer",
  "DSA Grinder",
  "Building in Public",
];

const STATS = [
  { icon: Code2, value: `${profile.stats.problemsSolved}+`, label: "DSA Solved" },
  {
    icon: Users,
    value: `${profile.stats.linkedinConnections.toLocaleString("en-IN")}+`,
    label: "LinkedIn Network",
  },
  { icon: Cpu, value: "Samsung IoT", label: "Capstone · SIC 2026" },
];

export function Hero() {
  const resumeUrl = profile.resumeUrl;
  const resumeAvailable = useResumeAvailable();
  const [rIndex, setRIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setRIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative overflow-hidden">
      {/* soft ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 right-0 h-[360px] w-[360px] rounded-full bg-[var(--sky)]/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 pt-36 pb-20 md:grid-cols-[minmax(0,1fr)_380px] md:items-center md:pt-44 md:pb-28">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-3.5 py-1.5 text-xs font-semibold text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--emerald)]" />
            </span>
            Available for SDE Roles & Internships
          </span>

          <p className="mt-6 text-sm font-medium text-muted-foreground">Hi, I'm {profile.name} 👋</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Software Engineer
            <br />
            <span className="text-gradient">&amp; Builder</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            CSE-DS @ RNSIT Bengaluru · Crafting resilient IoT systems & full-stack web products.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {profile.location}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span
              className={`font-medium text-primary transition-all duration-300 ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
              }`}
            >
              {ROLES[rIndex]}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6 shadow-card-hover">
              <a href="#projects">
                View Projects <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            {resumeUrl && resumeAvailable && (
              <Button asChild size="lg" variant="outline" className="rounded-full bg-card px-6">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download>
                  <FileText className="mr-1 h-4 w-4" /> Resume
                </a>
              </Button>
            )}
            <Button asChild size="lg" variant="ghost" className="rounded-full px-5">
              <a href="#contact">
                <Mail className="mr-1 h-4 w-4" /> Contact
              </a>
            </Button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <s.icon className="h-4 w-4 text-primary" />
                <div className="mt-2 text-xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <SocialIcons />
          </div>
        </div>

        {/* Glass portrait */}
        <div className="relative mx-auto w-full max-w-[340px] md:max-w-none">
          <div
            aria-hidden
            className="absolute -top-6 -left-6 h-20 w-20 rounded-2xl border border-card/60 bg-primary/15 backdrop-blur-md animate-[float-slow_7s_ease-in-out_infinite]"
          />
          <div
            aria-hidden
            className="absolute -right-4 -bottom-6 h-16 w-16 rounded-full border border-card/60 bg-[var(--sky)]/20 backdrop-blur-md animate-[float-slow_9s_ease-in-out_infinite_reverse]"
          />
          <div className="relative rounded-[2rem] border border-border bg-card/70 p-3 shadow-card-hover backdrop-blur-xl">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              loading="eager"
            />
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-border bg-card/85 px-4 py-3 shadow-card backdrop-blur-md">
              <div>
                <div className="text-sm font-semibold">{profile.name}</div>
                <div className="text-xs text-muted-foreground">RNSIT · Class of 2028</div>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                Open to work
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
