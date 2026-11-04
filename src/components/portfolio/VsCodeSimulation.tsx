import { useEffect, useRef, useState } from "react";

const CMD = "npm run dev";

type Line = { text: string; tone?: "dim" | "ok" | "blue" | "fn" };

const OUTPUT: Line[] = [
  { text: "> vivek-patne-portfolio@1.0.0 dev", tone: "dim" },
  { text: "> vite dev", tone: "dim" },
  { text: "" },
  { text: "  VITE v7.1.0  ready in 184 ms", tone: "ok" },
  { text: "" },
  { text: "  ➜  Local:   http://localhost:8080/", tone: "blue" },
  { text: "  ➜  Network: use --host to expose", tone: "dim" },
  { text: "" },
  { text: "\u2714 It works on my machine...", tone: "fn" },
  { text: "\u2714 ...and it works on YOUR machine too \u{1F680}", tone: "ok" },
];

const TREE = [
  { d: 0, t: "▾ VIVEK-PORTFOLIO", b: true },
  { d: 1, t: "▾ src" },
  { d: 2, t: "▸ components" },
  { d: 2, t: "▸ routes" },
  { d: 2, t: "▾ data" },
  { d: 3, t: "profile.ts" },
  { d: 3, t: "projects.ts" },
  { d: 1, t: "package.json", active: true },
  { d: 1, t: "vite.config.ts" },
  { d: 1, t: "README.md" },
];

const toneClass = (t?: Line["tone"]) =>
  t === "dim"
    ? "text-[var(--vsc-dim)]"
    : t === "ok"
      ? "text-[var(--vsc-ok)]"
      : t === "blue"
        ? "text-[var(--vsc-key)]"
        : t === "fn"
          ? "text-[var(--vsc-fn)]"
          : "text-[var(--vsc-text)]";

export function VsCodeSimulation() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const timers = useRef<number[]>([]);

  const close = () => {
    setLeaving(true);
    timers.current.push(window.setTimeout(() => setShow(false), 450));
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShow(true);
    if (reduced) {
      setTyped(CMD.length);
      setLines(OUTPUT.length);
      return;
    }
    const T = timers.current;
    let t = 700;
    for (let i = 1; i <= CMD.length; i++) {
      T.push(window.setTimeout(() => setTyped(i), t));
      t += 70;
    }
    t += 350;
    for (let i = 1; i <= OUTPUT.length; i++) {
      T.push(window.setTimeout(() => setLines(i), t));
      t += i >= OUTPUT.length - 2 ? 600 : 140;
    }
    return () => T.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;
  const done = lines >= OUTPUT.length;

  return (
    <div
      role="dialog"
      aria-label="Portfolio starting up"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--vsc-bar)] p-0 font-mono text-[13px] transition-opacity duration-500 sm:p-6 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden border border-[var(--vsc-border)] bg-[var(--vsc-bg)] shadow-card sm:h-[85vh] sm:rounded-xl">
        {/* title bar */}
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--vsc-border)] bg-[var(--vsc-bar)] px-3 text-xs text-[var(--vsc-dim)]">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-destructive" />
            <span className="h-3 w-3 rounded-full bg-[var(--amber-term)]" />
            <span className="h-3 w-3 rounded-full bg-[var(--vsc-ok)]" />
          </div>
          <span className="hidden truncate sm:block">vivek-patne-portfolio — Visual Studio Code</span>
          <button
            onClick={close}
            className="rounded border border-[var(--vsc-border)] px-2 py-0.5 text-[var(--vsc-text)] transition-colors hover:bg-[var(--vsc-side)]"
          >
            Skip [Esc]
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* activity bar */}
          <div className="hidden w-12 shrink-0 flex-col items-center gap-5 bg-[var(--vsc-side)] py-4 text-[var(--vsc-dim)] sm:flex">
            {["⎘", "⌕", "⑂", "▷", "⊞"].map((c, i) => (
              <span key={c} className={`text-lg ${i === 0 ? "text-[var(--vsc-text)]" : ""}`}>{c}</span>
            ))}
          </div>
          {/* explorer */}
          <div className="hidden w-56 shrink-0 border-r border-[var(--vsc-border)] bg-[var(--vsc-side)] py-2 md:block">
            <p className="px-4 pb-2 text-[11px] uppercase tracking-wider text-[var(--vsc-dim)]">Explorer</p>
            {TREE.map((n) => (
              <div
                key={n.t}
                style={{ paddingLeft: 12 + n.d * 12 }}
                className={`py-0.5 text-[var(--vsc-text)] ${n.b ? "font-bold" : ""} ${n.active ? "bg-[var(--vsc-border)]" : ""}`}
              >
                {n.t}
              </div>
            ))}
          </div>

          {/* editor + terminal */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-end border-b border-[var(--vsc-border)] bg-[var(--vsc-bar)]">
              <span className="border-t-2 border-[var(--vsc-blue)] bg-[var(--vsc-bg)] px-4 py-2 text-[var(--vsc-text)]">package.json</span>
              <span className="px-4 py-2 text-[var(--vsc-dim)]">profile.ts</span>
            </div>
            <pre className="min-h-0 flex-1 overflow-hidden p-4 leading-6 text-[var(--vsc-text)]">
              {[
                ["{"],
                ['  "name": ', '"vivek-patne-portfolio"', ","],
                ['  "author": ', '"Vivek Patne M"', ","],
                ['  "scripts": { "dev": ', '"vite dev"', " },"],
                ['  "stack": [', '"React 19", "TanStack Start", "Tailwind v4"', "],"],
                ['  "status": ', '"open-to-work"'],
                ["}"],
              ].map((p, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 w-6 select-none text-right text-[var(--vsc-dim)]">{i + 1}</span>
                  <span>
                    <span className="text-[var(--vsc-type)]">{p[0]}</span>
                    {p[1] && <span className="text-[var(--vsc-str)]">{p[1]}</span>}
                    {p[2]}
                  </span>
                </div>
              ))}
            </pre>

            {/* terminal */}
            <div className="h-[58%] shrink-0 overflow-y-auto border-t border-[var(--vsc-border)] bg-[var(--vsc-bar)] sm:h-[56%]">
              <div className="flex gap-5 border-b border-[var(--vsc-border)] px-4 py-1.5 text-[11px] uppercase tracking-wider text-[var(--vsc-dim)]">
                <span className="border-b border-[var(--vsc-text)] text-[var(--vsc-text)]">Terminal</span>
                <span>Output</span>
                <span className="hidden sm:inline">Debug Console</span>
              </div>
              <div className="px-4 py-3 leading-[1.4rem]">
                <div>
                  <span className="text-[var(--vsc-ok)]">vivek@bengaluru</span>
                  <span className="text-[var(--vsc-dim)]">:</span>
                  <span className="text-[var(--vsc-key)]">~/portfolio</span>
                  <span className="text-[var(--vsc-dim)]">$ </span>
                  <span className="text-[var(--vsc-text)]">{CMD.slice(0, typed)}</span>
                  {lines === 0 && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[var(--vsc-text)]" />}
                </div>
                {OUTPUT.slice(0, lines).map((l, i) => (
                  <div key={i} className={`vsc-line whitespace-pre-wrap ${toneClass(l.tone)}`}>
                    {l.text || "\u00a0"}
                  </div>
                ))}
                {done && (
                  <button
                    onClick={close}
                    className="vsc-line mt-3 rounded-md bg-[var(--vsc-blue)] px-4 py-2 font-semibold text-primary-foreground transition-transform hover:scale-105"
                  >
                    ⚡ Go Live — Open Portfolio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* status bar */}
        <div className="flex h-6 shrink-0 items-center justify-between bg-[var(--vsc-blue)] px-3 text-[11px] text-primary-foreground">
          <span>⑂ main* · 0 ⚠ 0 ✕</span>
          <span>{done ? "● Port 8080 live" : "TypeScript JSX · UTF-8"}</span>
        </div>
      </div>
    </div>
  );
}
