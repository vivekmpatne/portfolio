import {
  Github,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { socialLinks } from "@/data/links";

const iconMap: Record<string, LucideIcon> = {
  Github,
  Linkedin,
  Twitter,
};

export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socialLinks.map((s) => {
        const Icon = iconMap[s.icon] ?? Github;
        return (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={s.name}
            className="rounded-md border border-border p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
