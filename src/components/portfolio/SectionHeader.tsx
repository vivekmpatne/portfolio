const EYEBROWS: Record<string, string> = {
  "learning by building": "behind the work",
  "tools behind my work": "my working toolkit",
  projects: "built with intent",
  "experience & education": "learning through practice",
  "coding profiles": "across platforms",
  "consistency dashboard": "showing up, every day",
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="eyebrow-script mb-2 text-xl">{eyebrow ?? EYEBROWS[title.toLowerCase()] ?? "get in touch"}</p>
      <h2 className="display-heading text-4xl md:text-6xl">
      {title}
      </h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
