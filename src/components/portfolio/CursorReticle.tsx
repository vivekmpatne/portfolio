import { useEffect, useRef, useState } from "react";

/**
 * CursorReticle — a phosphor-green targeting reticle that replaces the default
 * pointer on fine-pointer devices. Dot follows the mouse 1:1; the ring trails
 * with easing and expands over interactive elements.
 */
export function CursorReticle() {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const hot = useRef(false);
  const down = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("has-reticle");
    return () => document.documentElement.classList.remove("has-reticle");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      hot.current = !!t?.closest?.(
        'a, button, [role="button"], input, textarea, select, summary, canvas, [data-cursor="hot"]',
      );
    };
    const onDown = () => (down.current = true);
    const onUp = () => (down.current = false);

    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;
      const scale = (hot.current ? 1.55 : 1) * (down.current ? 0.82 : 1);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.opacity = hot.current ? "1" : "0.75";
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="reticle-layer">
      <div ref={ringRef} className="reticle-ring">
        <span className="reticle-tick reticle-tick-t" />
        <span className="reticle-tick reticle-tick-b" />
        <span className="reticle-tick reticle-tick-l" />
        <span className="reticle-tick reticle-tick-r" />
      </div>
      <div ref={dotRef} className="reticle-dot" />
    </div>
  );
}
