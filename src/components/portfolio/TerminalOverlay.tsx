import { useEffect, useMemo, useRef, useState } from "react";
import { Shell as ShellIcon, X } from "lucide-react";
import { Shell } from "./Shell";

/**
 * Full-page terminal ambience:
 *   - CRT scanlines
 *   - Vignette
 *   - Slow-drifting floating character field (rendered on canvas for perf)
 *   - Bottom-right SHELL launcher + panel (opens the interactive Shell)
 *
 * All layers are pointer-events: none except the shell button/panel.
 * Backtick (`) toggles the shell.
 */
export function TerminalOverlay() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keyboard shortcut: ` toggles shell; Esc closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (e.key === "`" && !typing) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("term:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("term:open", onOpenEvent);
    };
  }, []);

  // Floating character field — drawn on canvas so it's cheap.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHARS = "01<>/{}[]#*&$%=+-_abcdefghijklmnopqrstuvwxyz";
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Array<{
      x: number;
      y: number;
      c: string;
      s: number;
      a: number;
      v: number;
    }> = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.floor((width * height) / 22000);
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        c: CHARS[Math.floor(Math.random() * CHARS.length)],
        s: 10 + Math.random() * 4,
        a: 0.04 + Math.random() * 0.09,
        v: 0.08 + Math.random() * 0.22,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `12px "JetBrains Mono", monospace`;
      const isDark = document.documentElement.classList.contains("dark");
      const rgb = isDark ? "120, 255, 170" : "40, 120, 70";
      for (const p of particles) {
        ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
        ctx.fillText(p.c, p.x, p.y);
        p.y -= p.v;
        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
          p.c = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      raf = requestAnimationFrame(draw);
    };

    // Respect reduced-motion — draw once and stop.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (reduced) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Floating character field */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
      />
      {/* Grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--phosphor) 40%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--phosphor) 40%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* Scanlines + vignette (dark-only) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 hidden dark:block"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.28) 3px, transparent 4px)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* (Removed OS label watermark) */}

      {/* SHELL launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 border border-[var(--phosphor)]/60 bg-background/90 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--phosphor)] backdrop-blur-sm transition-all hover:bg-[var(--phosphor)]/10 hover:shadow-[0_0_20px_-4px_var(--phosphor)]"
          aria-label="Open interactive shell"
        >
          <ShellIcon className="h-3.5 w-3.5" />
          <span>Shell</span>
          <kbd className="ml-1 rounded-sm border border-border px-1 text-[9px] text-muted-foreground">`</kbd>
        </button>
      )}

      {/* Shell panel */}
      {open && <ShellPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function ShellPanel({ onClose }: { onClose: () => void }) {
  const created = useMemo(
    () =>
      new Date().toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [],
  );
  return (
    <div className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col border border-[var(--phosphor)]/70 bg-background/95 shadow-[0_0_60px_-10px_var(--phosphor)] backdrop-blur-md md:inset-x-auto md:right-4 md:bottom-4 md:top-auto md:h-[540px] md:w-[520px]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[var(--phosphor)]/40 bg-black/50 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          guest@vivek:~ — {created}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close shell"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Shell onClose={onClose} />
    </div>
  );
}
