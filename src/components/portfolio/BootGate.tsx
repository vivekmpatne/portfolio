import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

/**
 * BootGate — a phosphor-CRT POST / kernel boot screen shown once per session
 * before the portfolio is revealed. Deliberately NOT a copy of any reference:
 * this is a Linux-style POST + kernel log + fsck of "vivek.dev", with a
 * character-scramble hostname and an [ ENTER SYSTEM ] gate.
 *
 * Always dark (like the Shell) regardless of light/dark theme.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*/<>[]{}=+-_";

const BOOT_LINES: Array<{ text: string; status?: string; ms: number }> = [
  { text: "POST: memory check 16384K ................", status: "OK", ms: 120 },
  { text: "kernel: phosphor-crt 3.1.4-vivek #1 SMP ...", status: "OK", ms: 110 },
  { text: "mount /dev/portfolio on / (ext4,rw) .......", status: "OK", ms: 100 },
  { text: "fsck /home/vivek ... 0 bad sectors ........", status: "OK", ms: 130 },
  { text: "modprobe dsa_engine  (400+ problems) ......", status: "OK", ms: 110 },
  { text: "net: linking github/leetcode/codeforces ...", status: "UP", ms: 140 },
  { text: "svc: activity-daemon  streak tracker ......", status: "OK", ms: 110 },
  { text: "svc: shell  (press ` anywhere) ............", status: "OK", ms: 100 },
  { text: "render: 3D city pipeline warm ............", status: "OK", ms: 120 },
];

const SESSION_KEY = "boot:v1";

export function BootGate() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const scrambleDone = useRef(false);

  // The overlay markup ships with SSR and is hidden by CSS unless the
  // pre-hydration script added `boot-pending` to <html> — so there is no flash
  // of the page before the boot screen appears.
  useEffect(() => {
    setMounted(true);
    setShow(document.documentElement.classList.contains("boot-pending"));
  }, []);

  const dismiss = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove("boot-pending");
      document.body.style.overflow = "";
    }, 520);
  }, [leaving]);


  // Boot log sequence
  useEffect(() => {
    if (!show) return;
    if (step >= BOOT_LINES.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), BOOT_LINES[step].ms);
    return () => window.clearTimeout(t);
  }, [show, step]);

  // Progress bar tracks the log, then finishes
  useEffect(() => {
    if (!show) return;
    const target = Math.round((step / BOOT_LINES.length) * 100);
    const t = window.setInterval(() => {
      setPct((p) => (p >= target ? p : Math.min(target, p + 2)));
    }, 12);
    return () => window.clearInterval(t);
  }, [show, step]);

  useEffect(() => {
    if (pct >= 100) setReady(true);
  }, [pct]);

  // Hostname scramble → resolves to the real name
  useEffect(() => {
    if (!show || scrambleDone.current) return;
    const target = profile.name.toUpperCase();
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 3);
      const out = target
        .split("")
        .map((ch, i) => {
          if (ch === " ") return " ";
          if (i < revealed) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setName(out);
      if (revealed >= target.length) {
        scrambleDone.current = true;
        setName(target);
        window.clearInterval(id);
      }
    }, 45);
    return () => window.clearInterval(id);
  }, [show]);

  // Any key / click enters once ready
  useEffect(() => {
    if (!show || !ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, ready, dismiss]);

  if (!mounted || !show) return null;

  return (
    <div
      role="dialog"
      aria-label="System boot"
      onClick={ready ? dismiss : undefined}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050d09] font-mono transition-all duration-500 ${
        leaving ? "pointer-events-none opacity-0 blur-sm" : "opacity-100"
      }`}
      style={{ color: "#8affb4" }}
    >
      {/* grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(120,255,170,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,255,170,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 78%)",
        }}
      />
      {/* scanlines + vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,.32) 3px, transparent 4px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.75) 100%)",
        }}
      />

      {/* corner brackets */}
      {[
        "left-4 top-4 border-l border-t",
        "right-4 top-4 border-r border-t",
        "left-4 bottom-4 border-b border-l",
        "right-4 bottom-4 border-b border-r",
      ].map((c) => (
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute h-10 w-10 border-[#3ddc84]/70 ${c}`}
        />
      ))}

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="text-center text-[10px] uppercase tracking-[0.5em] text-[#3ddc84]/70">
          [ vivek@rnsit — cold boot ]
        </div>

        <h2
          className="mt-4 text-center text-3xl tracking-[0.18em] sm:text-5xl"
          style={{
            fontFamily: 'var(--font-display), monospace',
            color: "#b8ffcc",
            textShadow: "0 0 18px rgba(61,220,132,.55), 0 0 46px rgba(61,220,132,.25)",
          }}
        >
          {name || "\u00a0"}
        </h2>
        <div className="mt-2 text-center text-[11px] uppercase tracking-[0.3em] text-[#3ddc84]/70">
          {profile.tagline}
        </div>

        {/* progress */}
        <div className="mx-auto mt-8 max-w-lg">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#3ddc84]/80">
            <span>booting portfolio</span>
            <span>{pct.toString().padStart(3, "0")}%</span>
          </div>
          <div className="mt-2 h-[6px] w-full border border-[#3ddc84]/40 bg-[#0d1f16]">
            <div
              className="h-full bg-[#3ddc84] transition-[width] duration-150"
              style={{ width: `${pct}%`, boxShadow: "0 0 14px #3ddc84" }}
            />
          </div>

          {/* boot log */}
          <div className="mt-4 h-[160px] overflow-hidden text-[11px] leading-[1.65] text-[#8affb4]/75">
            {BOOT_LINES.slice(0, step).map((l) => (
              <div key={l.text} className="flex items-center justify-between gap-3">
                <span className="truncate">{"> "}{l.text}</span>
                <span className="shrink-0 text-[#3ddc84]">[ {l.status} ]</span>
              </div>
            ))}
            {ready && (
              <div className="mt-2 text-[#b8ffcc]">
                {"> "}all systems nominal — welcome, guest
                <span className="term-cursor ml-1 align-[-0.15em]" />
              </div>
            )}
          </div>
        </div>

        {/* gate */}
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            disabled={!ready}
            onClick={dismiss}
            className={`w-full max-w-lg border px-6 py-3 text-sm uppercase tracking-[0.35em] transition-all ${
              ready
                ? "border-[#3ddc84] text-[#b8ffcc] hover:bg-[#3ddc84]/15"
                : "cursor-not-allowed border-[#3ddc84]/25 text-[#3ddc84]/35"
            }`}
            style={ready ? { boxShadow: "0 0 26px -4px #3ddc84" } : undefined}
          >
            {ready ? "Enter System" : "Initializing…"}
          </button>
          <div className="mt-3 h-4 text-[10px] tracking-[0.2em] text-[#3ddc84]/60">
            {ready ? "(click anywhere or press any key)" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
