export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="phosphor-glow">guest@vivek</span>
        <span className="opacity-60">:</span>
        <span className="opacity-70">~/portfolio</span>
        <span className="phosphor-glow">$</span>
        <span className="text-foreground/90">cat {slug}.md</span>
      </div>
      <h2 className="mt-3 font-display text-4xl md:text-5xl leading-none tracking-wide">
        <span className="phosphor-glow">#</span>{" "}
        <span className="text-foreground">{title}</span>
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground">// {subtitle}</p>
      ) : null}
      <div className="mt-4 h-px w-full bg-[repeating-linear-gradient(to_right,color-mix(in_oklab,var(--phosphor)_55%,transparent)_0_6px,transparent_6px_12px)]" />
    </div>
  );
}
