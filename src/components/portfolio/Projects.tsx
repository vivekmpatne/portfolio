import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Sparkles } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusDot: Record<Project["status"], string> = {
  live: "bg-green-500",
  "in-progress": "bg-amber-500",
  planned: "bg-slate-400",
};

export function Projects() {
  // Horizontal slider: one project at a time, arrows slide the next/previous
  // card into the middle. Keeps the page short as more projects are added.
  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, ordered.length - 1));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (child) track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setIndex(clamped);
  }, [ordered.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[];
      let best = 0;
      let bestDist = Infinity;
      children.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - track.scrollLeft);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader title="Projects" />
        <div className="mb-4 flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => scrollTo(index - 1)}
            disabled={index === 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => scrollTo(index + 1)}
            disabled={index >= ordered.length - 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ordered.map((p) => (
          <div key={p.id} className="w-full shrink-0 snap-start">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {ordered.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Go to ${p.title}`}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-foreground" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-xl md:grid md:grid-cols-2 md:gap-0">
      {project.image && (
        <div className="relative overflow-hidden border-b border-border bg-secondary aspect-[16/10] md:aspect-auto md:border-b-0 md:border-r">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[project.status]}`} />
            {statusLabel[project.status]}
          </span>
        </div>

        <h3 className="font-display font-semibold text-2xl md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.techStack.map((t) => (
            <span
              key={t}
              className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" /> Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" /> Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
