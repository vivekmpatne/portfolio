import { profile } from "@/data/profile";

export function PuzzleAvatar() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] select-none md:max-w-none">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-3 shadow-card backdrop-blur-xl">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
