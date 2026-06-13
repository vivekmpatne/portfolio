import { useState } from "react";
import { ArrowRight, FileText, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { SocialIcons } from "./SocialIcons";

export function Hero() {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section id="home" className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground shadow-card">
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
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" download>
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

        {/* Premium profile photo */}
        <div className="hidden md:block">
          <div className="group relative">
            <div
              className="absolute -inset-4 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, #6366f1, #8b5cf6, #ec4899, #f97316, #6366f1)",
              }}
            />
            <div
              className="relative h-60 w-60 rounded-full p-[3px] transition-transform duration-500 group-hover:scale-[1.03]"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
              }}
            >
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-card shadow-card-hover">
                {profile.avatar && !imgFailed ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <span
                    className="font-display text-6xl font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
