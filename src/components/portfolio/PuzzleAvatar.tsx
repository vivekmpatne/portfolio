import { useEffect, useState, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";
import { profile } from "@/data/profile";

interface SliceConfig {
  id: number;
  col: 0 | 1;
  row: 0 | 1 | 2;
  initX: string;
  initY: string;
  initRotate: number;
  delayMs: number;
}

const SLICES: SliceConfig[] = [
  { id: 0, col: 0, row: 0, initX: "-100vw", initY: "-60vh", initRotate: -28, delayMs: 40 },
  { id: 1, col: 1, row: 0, initX: "100vw", initY: "-70vh", initRotate: 32, delayMs: 120 },
  { id: 2, col: 0, row: 1, initX: "-110vw", initY: "10vh", initRotate: -18, delayMs: 80 },
  { id: 3, col: 1, row: 1, initX: "110vw", initY: "-15vh", initRotate: 24, delayMs: 160 },
  { id: 4, col: 0, row: 2, initX: "-90vw", initY: "85vh", initRotate: 22, delayMs: 100 },
  { id: 5, col: 1, row: 2, initX: "90vw", initY: "90vh", initRotate: -30, delayMs: 180 },
];

export function PuzzleAvatar() {
  const [replayKey, setReplayKey] = useState(0);
  const [assembled, setAssembled] = useState(false);
  const [animating, setAnimating] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [showSheen, setShowSheen] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setAssembled(true);
      setAnimating(false);
      setShowBadge(true);
      setShowSheen(false);
      return;
    }

    setAssembled(false);
    setAnimating(true);
    setShowBadge(false);
    setShowSheen(false);

    let settleTimer = 0;
    const startFrame = window.requestAnimationFrame(() => {
      setAssembled(true);
      settleTimer = window.setTimeout(() => {
        setShowSheen(true);
        setShowBadge(true);
        setAnimating(false);
      }, 1250);
    });

    return () => {
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(settleTimer);
    };
  }, [replayKey]);

  return (
    <div className="relative mx-auto w-full max-w-[340px] select-none md:max-w-none">
      <div
        aria-hidden="true"
        className={`absolute -left-6 -top-6 h-20 w-20 rounded-2xl border border-card/60 bg-primary/15 backdrop-blur-md transition-all duration-700 ${
          showBadge ? "scale-100 opacity-100 animate-[float-slow_7s_ease-in-out_infinite]" : "scale-75 opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute -bottom-6 -right-4 h-16 w-16 rounded-full border border-card/60 bg-[var(--sky)]/20 backdrop-blur-md transition-all duration-700 ${
          showBadge ? "scale-100 opacity-100 animate-[float-slow_9s_ease-in-out_infinite_reverse]" : "scale-75 opacity-0"
        }`}
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-3 shadow-card-hover backdrop-blur-xl">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-900">
          {!animating && (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="absolute inset-0 h-full w-full rounded-[1.5rem] object-cover"
              loading="eager"
            />
          )}

          {animating && SLICES.map((slice) => {
            const tileStyle: CSSProperties = {
              left: `${slice.col * 50}%`,
              top: `${(slice.row / 3) * 100}%`,
              width: "50%",
              height: "33.3333%",
              transform: assembled
                ? "translate(0, 0) rotate(0deg) scale(1)"
                : `translate(${slice.initX}, ${slice.initY}) rotate(${slice.initRotate}deg) scale(0.65)`,
              transition: `transform 950ms cubic-bezier(0.16, 1, 0.3, 1) ${slice.delayMs}ms, opacity 700ms ease-out ${slice.delayMs}ms`,
              opacity: assembled ? 1 : 0.2,
            };
            const imageStyle: CSSProperties = {
              left: slice.col === 0 ? "0%" : "-100%",
              top: slice.row === 0 ? "0%" : slice.row === 1 ? "-100%" : "-200%",
              width: "200%",
              height: "300%",
            };

            return (
              <div key={slice.id} aria-hidden="true" style={tileStyle} className="pointer-events-none absolute overflow-hidden border border-white/30 shadow-lg">
                <img src={profile.avatar} alt="" style={imageStyle} className="absolute max-w-none object-cover" />
              </div>
            );
          })}

          {showSheen && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent animate-[sheen-sweep_900ms_ease-out_forwards]"
            />
          )}
        </div>

        <div className={`absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-card backdrop-blur-md transition-all duration-700 ${showBadge ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <div>
            <div className="text-sm font-semibold text-foreground">{profile.name}</div>
            <div className="text-xs text-muted-foreground">RNSIT · Class of 2028</div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Open to work
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setReplayKey((key) => key + 1)}
        title="Replay puzzle assembly"
        aria-label="Replay portrait assembly animation"
        className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <RotateCcw className="h-3 w-3" /> Replay assembly
      </button>
    </div>
  );
}
