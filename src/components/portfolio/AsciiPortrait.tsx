import { useEffect, useRef, useState } from "react";
import portraitAsset from "@/assets/vivek-portrait.png.asset.json";

// Density ramp: dark → light
const RAMP = "01".split("");
const RAMP2 = "10.:-=+*#%@01vivekpatne".split("");

type Props = {
  width?: number; // number of chars across
  className?: string;
};

/**
 * Renders the portrait as a phosphor ASCII art field.
 * Sampled client-side from a canvas so it stays crisp on any DPI.
 */
export function AsciiPortrait({ width = 72, className = "" }: Props) {
  const [rows, setRows] = useState<Array<Array<{ ch: string; a: number }>>>([]);
  const rafRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = portraitAsset.url;
    img.onload = () => {
      const aspect = img.height / img.width;
      // Characters are ~2x taller than wide → compensate
      const cols = width;
      const rowsN = Math.round(cols * aspect * 0.55);
      const canvas = document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rowsN;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, cols, rowsN);
      const data = ctx.getImageData(0, 0, cols, rowsN).data;
      const out: Array<Array<{ ch: string; a: number }>> = [];
      for (let y = 0; y < rowsN; y++) {
        const row: Array<{ ch: string; a: number }> = [];
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // luminance
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // Invert: dark parts of face = bright chars
          const inv = 1 - lum;
          // Threshold near-white background to blank
          if (lum > 0.94) {
            row.push({ ch: " ", a: 0 });
            continue;
          }
          const rampIdx = Math.min(
            RAMP2.length - 1,
            Math.floor(inv * RAMP2.length),
          );
          const ch = RAMP2[rampIdx];
          row.push({ ch, a: Math.min(1, 0.35 + inv * 0.9) });
        }
        out.push(row);
      }
      setRows(out);
    };
  }, [width]);

  // Gentle scanline sweep
  useEffect(() => {
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 90) {
        setTick((v) => (v + 1) % 10000);
        last = t;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`relative select-none font-mono leading-[0.85] tracking-[0.05em] text-[9px] sm:text-[10px] md:text-[11px] ${className}`}
      aria-label="ASCII portrait of Vivek Patne"
      role="img"
    >
      <pre className="m-0 whitespace-pre">
        {rows.map((row, y) => (
          <div key={y} className="flex">
            {row.map((c, x) => {
              // Subtle horizontal shimmer following tick
              const shimmer = (x + y * 2 + tick) % 47 === 0 ? "0" : c.ch;
              return (
                <span
                  key={x}
                  style={{
                    color: "var(--phosphor)",
                    opacity: c.a,
                    textShadow:
                      c.a > 0.7
                        ? "0 0 6px color-mix(in oklab, var(--phosphor) 55%, transparent)"
                        : undefined,
                  }}
                >
                  {shimmer}
                </span>
              );
            })}
          </div>
        ))}
      </pre>
      {/* Scan overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0 2px, color-mix(in oklab, var(--phosphor) 10%, transparent) 2px 3px)",
          mixBlendMode: "overlay",
          opacity: 0.35,
        }}
      />
      {/* Corner brackets */}
      <span className="pointer-events-none absolute -left-2 -top-2 h-3 w-3 border-l border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -right-2 -top-2 h-3 w-3 border-r border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-2 -left-2 h-3 w-3 border-b border-l border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-2 -right-2 h-3 w-3 border-b border-r border-[var(--phosphor)]" />
    </div>
  );
}
