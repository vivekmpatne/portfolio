import { useMemo, useState } from "react";
import type { DayMap, PlatformId } from "@/lib/activity/types";
import { PLATFORM_LABELS } from "@/lib/activity/types";

const CELL = 12; // px footprint
const GAP = 3;
const UNIT = 5; // px height per contribution

type Props = {
  weeks: Array<Array<string | null>>;
  merged: DayMap;
  calendars: Record<PlatformId, DayMap>;
  colors: Record<PlatformId, string>;
};

function dominant(date: string, calendars: Record<PlatformId, DayMap>) {
  let best: PlatformId | null = null;
  let bestCount = 0;
  for (const key of Object.keys(calendars) as PlatformId[]) {
    const c = calendars[key][date] ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = key;
    }
  }
  return best;
}

export function GitCity({ weeks, merged, calendars, colors }: Props) {
  const [hover, setHover] = useState<{ date: string; count: number; parts: string[] } | null>(null);

  const buildings = useMemo(() => {
    const out: Array<{
      date: string;
      x: number;
      y: number;
      count: number;
      color: string;
      parts: string[];
    }> = [];
    weeks.forEach((week, wi) => {
      week.forEach((date, di) => {
        if (!date) return;
        const count = merged[date] ?? 0;
        if (count === 0) return;
        const top = dominant(date, calendars);
        const parts: string[] = [];
        for (const key of Object.keys(calendars) as PlatformId[]) {
          const c = calendars[key][date] ?? 0;
          if (c) parts.push(`${PLATFORM_LABELS[key]}: ${c}`);
        }
        out.push({
          date,
          x: wi * (CELL + GAP),
          y: di * (CELL + GAP),
          count,
          color: top ? colors[top] : "#3ddc84",
          parts,
        });
      });
    });
    return out;
  }, [weeks, merged, calendars, colors]);

  const planeW = weeks.length * (CELL + GAP);
  const planeH = 7 * (CELL + GAP);

  return (
    <div className="relative overflow-x-auto pb-4">
      <div className="mx-auto" style={{ width: "100%", minHeight: planeW * 0.55 + 200 }}>
        <div
          className="relative mx-auto"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(60deg) rotateZ(-45deg)",
            width: planeW,
            height: planeH,
            marginTop: planeW * 0.3 + 60,
          }}
        >
          {/* ground plate */}
          <div
            className="absolute rounded-sm border border-emerald-500/20 bg-emerald-500/5"
            style={{ left: -8, top: -8, width: planeW + 16, height: planeH + 16 }}
          />
          {buildings.map((b) => {
            const h = Math.min(b.count, 20) * UNIT + 4;
            return (
              <div
                key={b.date}
                className="absolute cursor-pointer"
                style={{ left: b.x, top: b.y, width: CELL, height: CELL, transformStyle: "preserve-3d" }}
                onMouseEnter={() => setHover({ date: b.date, count: b.count, parts: b.parts })}
                onMouseLeave={() => setHover(null)}
              >
                {/* roof */}
                <div
                  className="absolute inset-0 rounded-[2px]"
                  style={{ background: b.color, transform: `translateZ(${h}px)` }}
                />
                {/* front face (south) */}
                <div
                  className="absolute left-0 rounded-[1px]"
                  style={{
                    width: CELL,
                    height: h,
                    top: CELL,
                    background: b.color,
                    filter: "brightness(0.6)",
                    transformOrigin: "top",
                    transform: "rotateX(-90deg)",
                  }}
                />
                {/* side face (east) */}
                <div
                  className="absolute top-0 rounded-[1px]"
                  style={{
                    width: h,
                    height: CELL,
                    left: CELL,
                    background: b.color,
                    filter: "brightness(0.4)",
                    transformOrigin: "left",
                    transform: "rotateY(-90deg)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>


      <div className="mt-2 min-h-[52px] rounded-lg border border-border bg-background/60 px-3 py-2 text-xs">
        {hover ? (
          <>
            <div className="font-medium">
              {hover.date} — {hover.count} {hover.count === 1 ? "contribution" : "contributions"}
            </div>
            <div className="text-muted-foreground">{hover.parts.join(" · ")}</div>
          </>
        ) : (
          <span className="text-muted-foreground">
            Hover a tower — height = contributions that day, colour = most active platform.
          </span>
        )}
      </div>
    </div>
  );
}
