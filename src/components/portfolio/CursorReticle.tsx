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
    let lastT = performance.now();
    const rot = { v: 0 };
    const tilt = { v: 0 };
    const scl = { v: 1 };
    let lastHot: boolean | null = null;

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      const t = e.target as HTMLElement | null;
      hot.current = !!t?.closest?.(
        'a, button, [role="button"], input, textarea, select, summary, canvas, [data-cursor="hot"]',
      );
    };
    const onDown = () => (down.current = true);
    const onUp = () => (down.current = false);

    const tick = (now: number) => {
      // Frame-rate independent smoothing (dt clamped to avoid tab-switch spikes)
      const dt = Math.min((now - lastT) / 1000, 1 / 30);
      lastT = now;

      const dx = pos.current.x - ring.current.x;
      const dy = pos.current.y - ring.current.y;

      // Ring trails with a snappy-but-silky exponential follow
      const k = 1 - Math.exp(-dt * 16);
      ring.current.x += dx * k;
      ring.current.y += dy * k;

      // Rotation / tilt target only when actually moving fast enough
      const speed = Math.hypot(dx, dy);
      const targetRot = speed > 0.5 ? Math.atan2(dy, dx) * (180 / Math.PI) : rot.v;
      const targetTilt = Math.max(-10, Math.min(10, speed * 0.18));
      const targetScale = (hot.current ? 1.5 : 1) * (down.current ? 0.85 : 1);

      // Smooth secondary values so nothing "pops"
      const k2 = 1 - Math.exp(-dt * 10);
      // Interpolate rotation along the shortest arc
      let dRot = targetRot - rot.v;
      dRot = ((dRot + 540) % 360) - 180;
      rot.v += dRot * k2;
      tilt.v += (targetTilt - tilt.v) * k2;
      scl.v += (targetScale - scl.v) * k2;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x.toFixed(2)}px, ${ring.current.y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${rot.v.toFixed(2)}deg) rotateX(${tilt.v.toFixed(2)}deg) rotateY(${(tilt.v * 0.6).toFixed(2)}deg) scale(${scl.v.toFixed(3)})`;
        if (lastHot !== hot.current) {
          lastHot = hot.current;
          ringRef.current.style.opacity = hot.current ? "1" : "0.75";
        }
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
