export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 border-b border-border pb-4">
      <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
