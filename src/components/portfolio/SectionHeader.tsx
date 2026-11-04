const HEADERS: Record<string, string> = {
  about: "01. ABOUT",
  skills: "02. SKILLS",
  projects: "03. PROJECTS",
  "experience & education": "04. EXPERIENCE",
  "coding profiles": "05. CODING PROFILES",
  "consistency dashboard": "06. CONSISTENCY",
};

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const terminalTitle = HEADERS[title.toLowerCase()] ?? "07. CONTACT";
  return (
    <div className="mb-6 sm:mb-8">
      <p className="font-mono text-sm font-semibold tracking-wide text-primary">// {terminalTitle}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
