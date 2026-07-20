import { useEffect, useRef, useState } from "react";
import portraitAsset from "@/assets/vivek-portrait.png.asset.json";

// Density ramp: dim → dense. Mixes digits/letters so the portrait
// still reads as "code" but has real tonal range.
const RAMP = " .,:-=+*x#%@$█".split("");
// Character pool used to pick the specific glyph within a density bucket
const POOL = "01vivekpatne{}<>/#*+=%".split("");

type Props = {
  width?: number; // number of chars across
  className?: string;
};

/**
 * Renders the portrait as a phosphor ASCII art field.
 * Sampled client-side from a canvas so it stays crisp on any DPI.
 */
export function AsciiPortrait({ width = 78, className = "" }: Props) {
  const [rows, setRows] = useState<Array<Array<{ ch: string; a: number }>>>([]);
  const rafRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = portraitAsset.url;
    img.onload = () => {
      const aspect = img.height / img.width;
      const cols = width;
      // Characters are ~2x taller than wide → compensate
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
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // Invert: dark parts of face = bright chars
          const inv = 1 - lum;
          // Blank near-white background
          if (lum > 0.96) {
            row.push({ ch: " ", a: 0 });
            continue;
          }
          // Density bucket → char
          const dIdx = Math.min(
            RAMP.length - 1,
            Math.floor(inv * RAMP.length),
          );
          const densityCh = RAMP[dIdx];
          // For mid tones use pool chars so it feels like source code,
          // for very dark regions keep dense glyphs for definition.
          let ch: string;
          if (inv < 0.35) {
            ch = POOL[(x * 7 + y * 13) % POOL.length];
          } else {
            ch = densityCh;
          }
          // Opacity floor 0.55 so faint chars stay visible on dark bg
          const a = Math.min(1, 0.55 + inv * 0.75);
          row.push({ ch, a });
        }
        out.push(row);
      }
      setRows(out);
    };
  }, [width]);

  // Slow scanning highlight row
  useEffect(() => {
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 120) {
        setTick((v) => v + 1);
        last = t;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scanRow = rows.length ? tick % (rows.length + 20) : 0;

  return (
    <div
      className={`relative select-none font-mono leading-[0.9] tracking-[0.02em] text-[10px] sm:text-[11px] md:text-[12px] ${className}`}
      aria-label="ASCII portrait of Vivek Patne"
      role="img"
    >
      <pre className="m-0 whitespace-pre">
        {rows.map((row, y) => {
          const highlighted = y === scanRow;
          return (
            <div key={y} className="flex">
              {row.map((c, x) => (
                <span
                  key={x}
                  style={{
                    color: "var(--phosphor)",
                    opacity: highlighted && c.a > 0 ? Math.min(1, c.a + 0.25) : c.a,
                    textShadow:
                      c.a > 0.65
                        ? "0 0 4px color-mix(in oklab, var(--phosphor) 65%, transparent)"
                        : undefined,
                    fontWeight: c.a > 0.85 ? 700 : 400,
                  }}
                >
                  {c.ch}
                </span>
              ))}
            </div>
          );
        })}
      </pre>
      {/* Corner brackets */}
      <span className="pointer-events-none absolute -left-2 -top-2 h-3 w-3 border-l border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -right-2 -top-2 h-3 w-3 border-r border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-2 -left-2 h-3 w-3 border-b border-l border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-2 -right-2 h-3 w-3 border-b border-r border-[var(--phosphor)]" />
    </div>
  );
}

