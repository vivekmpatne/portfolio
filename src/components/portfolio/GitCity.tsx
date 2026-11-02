import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { DayMap, PlatformId } from "@/lib/activity/types";

const GitCity3D = lazy(() => import("./GitCity3D"));

type Props = {
  weeks: Array<Array<string | null>>;
  merged: DayMap;
  calendars: Record<PlatformId, DayMap>;
  colors: Record<PlatformId, string>;
};

function Skeleton() {
  return (
    <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-border bg-card/60 font-mono text-xs text-muted-foreground backdrop-blur-sm">
      building city…
    </div>
  );
}

export function GitCity(props: Props) {
  return (
    <ClientOnly fallback={<Skeleton />}>
      <Suspense fallback={<Skeleton />}>
        <GitCity3D {...props} />
      </Suspense>
    </ClientOnly>
  );
}
