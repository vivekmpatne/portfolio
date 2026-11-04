import { memo, useEffect, useRef, useState } from "react";
import portraitAsset from "@/assets/vivek-portrait.png";

const RAMP = " .`'-:_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const POOL = "01vivekpatne{}<>/#*+=%";

type Glyph = { ch: string; alpha: number };
type Props = { width?: number; className?: string };

/** Samples the portrait once and paints the glyphs to one canvas instead of thousands of DOM nodes. */
export const AsciiPortrait = memo(function AsciiPortrait({ width = 96, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rows, setRows] = useState<Glyph[][]>([]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = portraitAsset;
    img.onload = () => {
      if (cancelled) return;
      const rowCount = Math.round(width * (img.height / img.width) * 0.5);
      const sample = document.createElement("canvas");
      sample.width = width;
      sample.height = rowCount;
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx) return;
      sampleCtx.filter = "contrast(125%) brightness(98%)";
      sampleCtx.drawImage(img, 0, 0, width, rowCount);
      const pixels = sampleCtx.getImageData(0, 0, width, rowCount).data;
      const glyphRows: Glyph[][] = [];

      for (let y = 0; y < rowCount; y++) {
        const row: Glyph[] = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const luminance = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) / 255;
          if (luminance > 0.97) {
            row.push({ ch: " ", alpha: 0 });
            continue;
          }
          const density = Math.pow(1 - luminance, 0.72);
          const rampIndex = Math.min(RAMP.length - 1, Math.floor(density * RAMP.length));
          const ch = density < 0.28 ? POOL[(x * 7 + y * 13) % POOL.length] : RAMP[rampIndex];
          row.push({ ch, alpha: Math.min(1, 0.62 + density * 0.7) });
        }
        glyphRows.push(row);
      }
      setRows(glyphRows);
    };
    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container || rows.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      const height = rect.width * (rows.length * 1.5) / width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, height);
      const cellWidth = rect.width / width;
      const cellHeight = height / rows.length;
      const fontSize = Math.min(cellWidth / 0.6, cellHeight / 0.9);
      const phosphor = getComputedStyle(document.documentElement).getPropertyValue("--phosphor").trim();
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = phosphor || "#4ade80";
      rows.forEach((row, y) => row.forEach((glyph, x) => {
        if (glyph.alpha === 0) return;
        ctx.globalAlpha = glyph.alpha;
        ctx.fillText(glyph.ch, x * cellWidth, y * cellHeight);
      }));
      ctx.globalAlpha = 1;
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(container);
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    void document.fonts?.ready.then(draw);
    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [rows, width]);

  const aspectRatio = rows.length ? `${width} / ${rows.length * 1.5}` : `${width} / ${width}`;
  return (
    <div
      className={`relative w-full select-none ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label="ASCII portrait of Vivek Patne M"
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-2.5 w-2.5 border-l border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-2.5 w-2.5 border-r border-t border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-2.5 w-2.5 border-b border-l border-[var(--phosphor)]" />
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-2.5 w-2.5 border-b border-r border-[var(--phosphor)]" />
    </div>
  );
});
