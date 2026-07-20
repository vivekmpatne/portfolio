import { useEffect, useRef, useState } from "react";
import portraitAsset from "@/assets/vivek-portrait.png";

// Density ramp: dim → dense. Mixes digits/letters so the portrait
// still reads as "code" but has real tonal range.
const RAMP =
  " .`'-:_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@".split(
    "",
  );
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
export function AsciiPortrait({ width = 96, className = "" }: Props) {
  const [rows, setRows] = useState<Array<Array<{ ch: string; a: number }>>>([]);
  const rafRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = portraitAsset;
    img.onload = () => {
      const aspect = img.height / img.width;
      const cols = width;
      // Characters are ~2x taller than wide → compensate
      const rowsN = Math.round(cols * aspect * 0.5);
      const canvas = document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rowsN;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Slight contrast boost via filter
      ctx.filter = "contrast(125%) brightness(98%)";
      ctx.drawImage(img, 0, 0, cols, rowsN);
      const data = ctx.getImageData(0, 0, cols, rowsN).data;
      const out: Array<Array<{ ch: string; a: number }>> = [];
      for (let y = 0; y < rowsN; y++) {
        const row: Array<{ ch: string; a: number }> = [];
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // Invert: dark parts of face = bright chars
          let inv = 1 - lum;
          // Gamma to lift mid/dark tones (more definition in hair/face)
          inv = Math.pow(inv, 0.72);
          // Blank near-white background only
          if (lum > 0.97) {
            row.push({ ch: " ", a: 0 });
            continue;
          }
          const dIdx = Math.min(RAMP.length - 1, Math.floor(inv * RAMP.length));
          const densityCh = RAMP[dIdx];
          let ch: string;
          if (inv < 0.28) {
            ch = POOL[(x * 7 + y * 13) % POOL.length];
          } else {
            ch = densityCh;
          }
          const a = Math.min(1, 0.62 + inv * 0.7);
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

  // Auto-fit: each mono char ~0.6em wide → font-size = 100% / (cols * 0.6) of container
  const fontSize = `calc((100cqi) / ${width} / 0.6)`;
  return (
    <div
      className={`@container relative w-full select-none font-mono leading-[0.9] tracking-[0.01em] ${className}`}
      style={{ containerType: "inline-size" }}
      aria-label="ASCII portrait of Vivek Patne"
      role="img"
    >
      <pre className="m-0 w-full overflow-hidden whitespace-pre" style={{ fontSize }}>
        {rows.map((row, y) => {
          const highlighted = y === scanRow;
          return (
            <div key={y} className="flex">
              {row.map((c, x) => {
                const base = c.a === 0 ? 0 : Math.max(0.7, c.a);
                const op = highlighted && c.a > 0 ? Math.min(1, base + 0.2) : base;
                return (
                  <span
                    key={x}
                    style={{
                      color: "var(--phosphor)",
                      opacity: op,
                      textShadow:
                        c.a > 0.6
                          ? "0 0 3px color-mix(in oklab, var(--phosphor) 75%, transparent)"
                          : undefined,
                      fontWeight: c.a > 0.8 ? 700 : 500,
                    }}
                  >
                    {c.ch}
                  </span>
                );
              })}
            </div>
          );
        })}
      </pre>
      {/* Corner brackets */}
      <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-2.5 w-2.5 border-l border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-2.5 w-2.5 border-r border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-2.5 w-2.5 border-b border-l border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-2.5 w-2.5 border-b border-r border-[var(--phosphor)]" />
    </div>
  );
}
