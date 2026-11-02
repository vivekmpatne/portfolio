const ORDER = [
  "about",
  "skills",
  "projects",
  "experience & education",
  "coding profiles",
  "consistency",
  "contact",
];

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const idx = ORDER.indexOf(title.toLowerCase());
  const num = idx >= 0 ? String(idx + 1).padStart(2, "0") : null;
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {num && <span>{num}</span>}
        <span className="h-px w-8 bg-primary/40" />
        <span className="text-muted-foreground">{title}</span>
      </div>
      <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
