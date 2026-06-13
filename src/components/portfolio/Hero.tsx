import { ArrowRight, FileText, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { SocialIcons } from "./SocialIcons";

export function Hero() {
  return (
    <section id="home" className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Open to SDE-1 opportunities
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Hi, I'm {profile.name}.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {profile.tagline}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {profile.location}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href="#projects">
                View Projects <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                <FileText className="mr-1 h-4 w-4" /> Resume
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a href="#contact">
                <Mail className="mr-1 h-4 w-4" /> Contact
              </a>
            </Button>
          </div>

          <div className="mt-8">
            <SocialIcons />
          </div>
        </div>

        {/* Avatar */}
        <div className="hidden md:block">
          <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-border bg-secondary">
            {/* TODO: replace placeholder with actual photo in /public */}
            <div className="flex h-full w-full items-center justify-center font-display text-6xl text-muted-foreground">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
