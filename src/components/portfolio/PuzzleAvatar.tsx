import { useEffect, useState, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";
import { profile } from "@/data/profile";

const SVG_WIDTH = 400;
const SVG_HEIGHT = 500;
const COLUMN_WIDTH = SVG_WIDTH / 2;
const ROW_HEIGHT = SVG_HEIGHT / 3;

interface PuzzlePiece {
  id: number;
  column: number;
  row: number;
  x: string;
  y: string;
  rotation: number;
  scale: number;
  delayMs: number;
  path: string;
}

const entrance = [
  { x: "-95vw", y: "-65vh", rotation: -32, scale: 0.7, delayMs: 30 },
  { x: "95vw", y: "-75vh", rotation: 35, scale: 0.72, delayMs: 110 },
  { x: "-110vw", y: "8vh", rotation: -24, scale: 0.76, delayMs: 70 },
  { x: "110vw", y: "-12vh", rotation: 26, scale: 0.68, delayMs: 170 },
  { x: "-90vw", y: "85vh", rotation: 23, scale: 0.72, delayMs: 100 },
  { x: "90vw", y: "90vh", rotation: -38, scale: 0.74, delayMs: 200 },
] as const;

type Point = readonly [number, number];

function edgePath(start: Point, end: Point, normal: Point, tabDirection: number) {
  const horizontal = start[1] === end[1];
  const distance = horizontal ? end[0] - start[0] : end[1] - start[1];
  const direction = Math.sign(distance);
  const length = Math.abs(distance);
  const center = (horizontal ? start[0] : start[1]) + distance / 2;
  const fixed = horizontal ? start[1] : start[0];
  const point = (along: number, out: number): Point => horizontal
    ? [center + direction * along, fixed + normal[1] * out * tabDirection]
    : [fixed + normal[0] * out * tabDirection, center + direction * along];
  const p = (along: number, out: number) => {
    const [x, y] = point(along, out);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  const startTab = point(-27, 0);
  const endTab = point(27, 0);
  if (length < 60) return `L ${end[0]} ${end[1]}`;
  return [
    `L ${startTab[0].toFixed(2)} ${startTab[1].toFixed(2)}`,
    `C ${p(-27, 8)} ${p(-20, 11)} ${p(-14, 11)}`,
    `C ${p(-7, 11)} ${p(-12, 27)} ${p(0, 27)}`,
    `C ${p(12, 27)} ${p(7, 11)} ${p(14, 11)}`,
    `C ${p(20, 11)} ${p(27, 8)} ${p(27, 0)}`,
    `L ${endTab[0].toFixed(2)} ${endTab[1].toFixed(2)}`,
    `L ${end[0]} ${end[1]}`,
  ].join(" ");
}

function straightEdge(end: Point) {
  return `L ${end[0]} ${end[1]}`;
}

function createPiecePath(column: number, row: number) {
  const x0 = column * COLUMN_WIDTH;
  const x1 = x0 + COLUMN_WIDTH;
  const y0 = row * ROW_HEIGHT;
  const y1 = y0 + ROW_HEIGHT;
  const topLeft: Point = [x0, y0];
  const topRight: Point = [x1, y0];
  const bottomRight: Point = [x1, y1];
  const bottomLeft: Point = [x0, y1];
  const horizontalSign = (boundary: number) => boundary === 1 ? 1 : -1;
  const verticalSign = row % 2 === 0 ? 1 : -1;

  const top = row === 0
    ? straightEdge(topRight)
    : edgePath(topLeft, topRight, [0, 1], horizontalSign(row));
  const right = column === 1
    ? straightEdge(bottomRight)
    : edgePath(topRight, bottomRight, [1, 0], verticalSign);
  const bottom = row === 2
    ? straightEdge(bottomLeft)
    : edgePath(bottomRight, bottomLeft, [0, 1], horizontalSign(row + 1));
  const left = column === 0
    ? straightEdge(topLeft)
    : edgePath(bottomLeft, topLeft, [1, 0], verticalSign);

  return `M ${x0} ${y0} ${top} ${right} ${bottom} ${left} Z`;
}

const PIECES: PuzzlePiece[] = Array.from({ length: 6 }, (_, id) => {
  const column = id % 2;
  const row = Math.floor(id / 2);
  return { id, column, row, ...entrance[id]!, path: createPiecePath(column, row) };
});

export function PuzzleAvatar() {
  const [replayKey, setReplayKey] = useState(0);
  const [assembled, setAssembled] = useState(false);
  const [animating, setAnimating] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [showSheen, setShowSheen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      }, 1300);
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
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
          {animating ? (
            PIECES.map((piece) => {
              const clipId = `portrait-piece-${piece.id}`;
              const transform = assembled
                ? "translate3d(0, 0, 0) rotate(0deg) scale(1)"
                : `translate3d(${piece.x}, ${piece.y}, 0) rotate(${piece.rotation}deg) scale(${piece.scale})`;
              const style: CSSProperties = {
                transform,
                transformOrigin: "50% 50%",
                transition: `transform 1050ms cubic-bezier(0.16, 1, 0.3, 1) ${piece.delayMs}ms`,
                willChange: "transform",
              };
              return (
                <div key={piece.id} aria-hidden="true" className="pointer-events-none absolute inset-0" style={style}>
                  <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
                    <defs>
                      <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                        <path d={piece.path} />
                      </clipPath>
                    </defs>
                    <image
                      href={profile.avatar}
                      x="0"
                      y="0"
                      width={SVG_WIDTH}
                      height={SVG_HEIGHT}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#${clipId})`}
                    />
                    <path d={piece.path} fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              );
            })
          ) : (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          )}

          {showSheen && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-screen animate-[sheen-sweep_900ms_ease-out_forwards]"
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
