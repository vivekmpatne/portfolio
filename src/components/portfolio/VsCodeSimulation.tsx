import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Files,
  Search,
  GitBranch,
  Play,
  Blocks,
  CircleUser,
  Settings,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  X,
  Plus,
  Trash2,
  Maximize2,
  RefreshCw,
  Radio,
  Bell,
  MoreHorizontal,
} from "lucide-react";

/* Authentic VS Code Dark+ palette (intentionally fixed: this screen mimics a real app). */
const C = {
  title: "#1f1f1f",
  activity: "#181818",
  side: "#181818",
  editor: "#1f1f1f",
  tabs: "#181818",
  panel: "#181818",
  border: "#2b2b2b",
  text: "#cccccc",
  dim: "#858585",
  hover: "#2a2d2e",
  select: "#37373d",
  blue: "#0078d4",
  status: "#007acc",
  key: "#9cdcfe",
  str: "#ce9178",
  num: "#b5cea8",
  kw: "#569cd6",
  ctrl: "#c586c0",
  fn: "#dcdcaa",
  type: "#4ec9b0",
  punc: "#d4d4d4",
  green: "#23d18b",
  yellow: "#e5e510",
};

const CMD = "npm run dev";

type Line = { text: string; color?: string };
const OUTPUT: Line[] = [
  { text: "> vivek-patne-portfolio@1.0.0 dev", color: C.dim },
  { text: "> vite dev", color: C.dim },
  { text: "" },
  { text: "  VITE v7.1.0  ready in 184 ms", color: C.green },
  { text: "" },
  { text: "  ➜  Local:   http://localhost:8080/", color: "#3b8eea" },
  { text: "  ➜  Network: use --host to expose", color: C.dim },
  { text: "" },
  { text: "✔ It works on my machine...", color: C.yellow },
  { text: "✔ ...and it works on YOUR machine too 🚀", color: C.green },
];

type FileId = "package.json" | "profile.ts" | "projects.ts" | "vite.config.ts" | "README.md";

/* Syntax tokens: [text, color] */
type Tok = [string, string?];
const CODE: Record<FileId, Tok[][]> = {
  "package.json": [
    [["{", C.punc]],
    [["  "], ['"name"', C.key], [": "], ['"vivek-patne-portfolio"', C.str], [","]],
    [["  "], ['"author"', C.key], [": "], ['"Vivek Patne M"', C.str], [","]],
    [["  "], ['"version"', C.key], [": "], ['"1.0.0"', C.str], [","]],
    [["  "], ['"scripts"', C.key], [": { "], ['"dev"', C.key], [": "], ['"vite dev"', C.str], [" },"]],
    [["  "], ['"stack"', C.key], [": ["], ['"React 19"', C.str], [", "], ['"TanStack Start"', C.str], [", "], ['"Tailwind v4"', C.str], ["],"]],
    [["  "], ['"dsaSolved"', C.key], [": "], ["500", C.num], [","]],
    [["  "], ['"openToWork"', C.key], [": "], ["true", C.kw]],
    [["}", C.punc]],
  ],
  "profile.ts": [
    [["export const ", C.kw], ["profile", C.key], [" = {"]],
    [["  name", C.key], [": "], ['"Vivek Patne M"', C.str], [","]],
    [["  role", C.key], [": "], ['"Aspiring SDE"', C.str], [","]],
    [["  degree", C.key], [": "], ['"B.E. CSE (Data Science)"', C.str], [","]],
    [["  cgpa", C.key], [": "], ["8.35", C.num], [","]],
    [["  location", C.key], [": "], ['"Bengaluru, IN"', C.str], [","]],
    [["}", C.punc], [" as const", C.kw], [";"]],
  ],
  "projects.ts": [
    [["import ", C.ctrl], ["{ "], ["Project", C.type], [" } "], ["from ", C.ctrl], ['"./types"', C.str], [";"]],
    [[""]],
    [["export const ", C.kw], ["projects", C.key], [": "], ["Project", C.type], ["[] = ["]],
    [["  { "], ["title", C.key], [": "], ['"Smart Drain Monitoring"', C.str], [" },"]],
    [["  { "], ["title", C.key], [": "], ['"HomeOS Smart Home"', C.str], [" },"]],
    [["];"]],
  ],
  "vite.config.ts": [
    [["import ", C.ctrl], ["{ "], ["defineConfig", C.fn], [" } "], ["from ", C.ctrl], ['"vite"', C.str], [";"]],
    [[""]],
    [["export default ", C.ctrl], ["defineConfig", C.fn], ["({"]],
    [["  server", C.key], [": { "], ["port", C.key], [": "], ["8080", C.num], [" },"]],
    [["});"]],
  ],
  "README.md": [
    [["# Vivek Patne M", C.kw]],
    [[""]],
    [["> It works on my machine. It works on yours too.", C.dim]],
    [[""]],
    [["- ", C.punc], ["Run "], ["`npm run dev`", C.str], [" and hit "], ["Go Live", C.fn]],
  ],
};

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".ts"))
    return <span className="w-4 shrink-0 text-center text-[9px] font-bold" style={{ color: "#3178c6" }}>TS</span>;
  if (name.endsWith(".json"))
    return <span className="w-4 shrink-0 text-center text-[10px] font-bold" style={{ color: "#cbcb41" }}>{"{}"}</span>;
  if (name.endsWith(".md"))
    return <span className="w-4 shrink-0 text-center text-[10px] font-bold" style={{ color: "#519aba" }}>M↓</span>;
  return <span className="w-4" />;
}

type Node =
  | { kind: "dir"; name: string; depth: number; open: boolean; dim?: boolean }
  | { kind: "file"; name: FileId; depth: number };

const TREE: Node[] = [
  { kind: "dir", name: "src", depth: 0, open: true },
  { kind: "dir", name: "components", depth: 1, open: false },
  { kind: "dir", name: "routes", depth: 1, open: false },
  { kind: "dir", name: "data", depth: 1, open: true },
  { kind: "file", name: "profile.ts", depth: 2 },
  { kind: "file", name: "projects.ts", depth: 2 },
  { kind: "dir", name: "node_modules", depth: 0, open: false, dim: true },
  { kind: "file", name: "package.json", depth: 0 },
  { kind: "file", name: "README.md", depth: 0 },
  { kind: "file", name: "vite.config.ts", depth: 0 },
];

function ActIcon({ children, active, onClick, label, badge }: { children: ReactNode; active?: boolean; onClick?: () => void; label: string; badge?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex h-11 w-full items-center justify-center transition-colors"
      style={{ color: active ? "#ffffff" : C.dim, borderLeft: `2px solid ${active ? "#ffffff" : "transparent"}` }}
    >
      {children}
      {badge ? (
        <span className="absolute bottom-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white" style={{ background: C.blue }}>
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function VsCodeSimulation() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [file, setFile] = useState<FileId>("package.json");
  const [tabs, setTabs] = useState<FileId[]>(["package.json", "profile.ts"]);
  const [explorer, setExplorer] = useState(true);
  const timers = useRef<number[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setLeaving(true);
    timers.current.push(window.setTimeout(() => setShow(false), 450));
  };

  const openFile = (f: FileId) => {
    setFile(f);
    setTabs((t) => (t.includes(f) ? t : [...t, f]));
    if (window.innerWidth < 640) setExplorer(false);
  };

  const closeTab = (f: FileId) => {
    setTabs((t) => {
      const next = t.filter((x) => x !== f);
      if (f === file && next.length) setFile(next[next.length - 1]);
      return next.length ? next : t;
    });
  };

  useEffect(() => {
    // Collapse explorer on phones so the editor + terminal stay readable.
    if (window.innerWidth < 640) setExplorer(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [lines]);

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
  const code = CODE[file];
  const lang = file.endsWith(".json") ? "JSON" : file.endsWith(".md") ? "Markdown" : "TypeScript";

  return (
    <div
      role="dialog"
      aria-label="Portfolio starting up"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-0 font-mono text-[13px] transition-opacity duration-500 sm:p-6 ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ background: "#0e0e0e", color: C.text, fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace" }}
    >
      <div
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden sm:h-[88vh] sm:rounded-lg"
        style={{ background: C.editor, border: `1px solid ${C.border}`, boxShadow: "0 30px 80px -20px rgba(0,0,0,.8)" }}
      >
        {/* Title bar */}
        <div className="relative flex h-9 shrink-0 items-center justify-between px-3 text-xs" style={{ background: C.title, borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-3 hidden gap-3 xl:flex" style={{ color: C.text }}>
              {["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </span>
          </div>
          <div
            className="absolute left-1/2 hidden h-6 w-[30%] -translate-x-1/2 items-center justify-center gap-2 rounded-md sm:flex"
            style={{ background: "#2a2a2a", border: `1px solid ${C.border}`, color: C.dim }}
          >
            <Search size={12} /> vivek-patne-portfolio
          </div>
          <button
            onClick={close}
            className="rounded px-2 py-0.5 transition-colors hover:bg-[#2a2d2e]"
            style={{ color: C.text, border: `1px solid ${C.border}` }}
          >
            Skip [Esc]
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Activity bar */}
          <div className="flex w-10 shrink-0 flex-col justify-between sm:w-12" style={{ background: C.activity, borderRight: `1px solid ${C.border}` }}>
            <div>
              <ActIcon label="Explorer" active={explorer} onClick={() => setExplorer((v) => !v)}>
                <Files size={22} strokeWidth={1.5} />
              </ActIcon>
              <ActIcon label="Search"><Search size={22} strokeWidth={1.5} /></ActIcon>
              <ActIcon label="Source Control" badge={3}><GitBranch size={22} strokeWidth={1.5} /></ActIcon>
              <ActIcon label="Run and Debug"><Play size={22} strokeWidth={1.5} /></ActIcon>
              <ActIcon label="Extensions"><Blocks size={22} strokeWidth={1.5} /></ActIcon>
            </div>
            <div className="pb-1">
              <ActIcon label="Accounts"><CircleUser size={22} strokeWidth={1.5} /></ActIcon>
              <ActIcon label="Manage"><Settings size={22} strokeWidth={1.5} /></ActIcon>
            </div>
          </div>

          {/* Explorer */}
          {explorer && (
            <div className="w-48 shrink-0 select-none overflow-y-auto sm:w-60" style={{ background: C.side, borderRight: `1px solid ${C.border}` }}>
              <div className="flex h-9 items-center justify-between px-4 text-[11px] uppercase tracking-wide" style={{ color: C.text }}>
                <span>Explorer</span>
                <MoreHorizontal size={16} style={{ color: C.dim }} />
              </div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-[11px] font-bold uppercase" style={{ color: C.text }}>
                <ChevronDown size={16} /> Vivek-Portfolio
              </div>
              {TREE.map((n) => {
                const active = n.kind === "file" && n.name === file;
                return (
                  <button
                    type="button"
                    key={n.name}
                    onClick={() => n.kind === "file" && openFile(n.name)}
                    className="flex h-[22px] w-full items-center gap-1.5 pr-2 text-left text-[13px] hover:bg-[#2a2d2e]"
                    style={{
                      paddingLeft: 8 + n.depth * 12 + (n.kind === "file" ? 18 : 0),
                      background: active ? C.select : undefined,
                      outline: active ? `1px solid ${C.blue}` : undefined,
                      outlineOffset: -1,
                      color: n.kind === "dir" && n.dim ? C.dim : C.text,
                    }}
                  >
                    {n.kind === "dir" ? (
                      <>
                        {n.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {n.open ? <FolderOpen size={15} color="#dcb67a" /> : <Folder size={15} color="#dcb67a" />}
                      </>
                    ) : (
                      <FileIcon name={n.name} />
                    )}
                    <span className="truncate">{n.name}</span>
                    {n.kind === "file" && n.name === "profile.ts" && (
                      <span className="ml-auto text-[11px]" style={{ color: "#e2c08d" }}>M</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Editor + panel */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Tabs */}
            <div className="flex h-9 shrink-0 overflow-x-auto" style={{ background: C.tabs, borderBottom: `1px solid ${C.border}` }}>
              {tabs.map((t) => {
                const on = t === file;
                return (
                  <div
                    key={t}
                    onClick={() => setFile(t)}
                    className="group flex shrink-0 cursor-pointer items-center gap-2 px-3"
                    style={{
                      background: on ? C.editor : "transparent",
                      borderTop: `1px solid ${on ? C.blue : "transparent"}`,
                      borderRight: `1px solid ${C.border}`,
                      color: on ? "#ffffff" : C.dim,
                    }}
                  >
                    <FileIcon name={t} />
                    <span>{t}</span>
                    <button
                      type="button"
                      aria-label={`Close ${t}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(t);
                      }}
                      className={`rounded p-0.5 hover:bg-[#3c3c3c] ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Breadcrumb */}
            <div className="flex h-6 shrink-0 items-center gap-1 px-4 text-xs" style={{ color: C.dim }}>
              vivek-portfolio <ChevronRight size={12} /> {file.endsWith(".ts") && file !== "vite.config.ts" ? <>src <ChevronRight size={12} /> data <ChevronRight size={12} /></> : null}
              <FileIcon name={file} /> {file}
            </div>
            {/* Code */}
            <div className="min-h-0 flex-1 overflow-auto py-1 leading-[20px]">
              {code.map((toks, i) => (
                <div key={`${file}-${i}`} className="flex whitespace-pre" style={{ background: i === code.length - 1 ? "#282828" : undefined }}>
                  <span className="w-12 shrink-0 select-none pr-4 text-right" style={{ color: i === code.length - 1 ? "#c6c6c6" : "#6e7681" }}>
                    {i + 1}
                  </span>
                  <span>
                    {toks.map(([s, col], j) => (
                      <span key={j} style={{ color: col ?? C.punc }}>{s}</span>
                    ))}
                    {i === code.length - 1 && <span className="vsc-caret ml-px inline-block h-4 w-[2px] translate-y-0.5" style={{ background: "#aeafad" }} />}
                  </span>
                </div>
              ))}
            </div>

            {/* Panel */}
            <div className="flex h-[52%] shrink-0 flex-col" style={{ background: C.panel, borderTop: `1px solid ${C.border}` }}>
              <div className="flex h-9 shrink-0 items-center justify-between px-4 text-[11px] uppercase tracking-wide" style={{ color: C.dim }}>
                <div className="flex h-full items-center gap-5 overflow-x-auto">
                  <span className="hidden sm:inline">Problems</span>
                  <span className="hidden sm:inline">Output</span>
                  <span className="hidden md:inline">Debug Console</span>
                  <span className="flex h-full items-center" style={{ color: "#e7e7e7", borderBottom: `1px solid ${C.blue}` }}>Terminal</span>
                  <span className="hidden md:inline">Ports <span className="ml-1 rounded-full px-1.5 text-[10px] text-white" style={{ background: C.blue }}>1</span></span>
                </div>
                <div className="flex items-center gap-3 normal-case">
                  <span className="hidden items-center gap-1 sm:flex"><span style={{ color: C.text }}>bash</span></span>
                  <Plus size={15} />
                  <Trash2 size={14} className="hidden sm:block" />
                  <Maximize2 size={13} className="hidden sm:block" />
                  <X size={15} />
                </div>
              </div>
              <div ref={termRef} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 leading-[1.4rem]">
                <div>
                  <span style={{ color: C.green }}>vivek@bengaluru</span>
                  <span style={{ color: C.text }}>:</span>
                  <span style={{ color: "#3b8eea" }}>~/portfolio</span>
                  <span style={{ color: C.text }}>$ {CMD.slice(0, typed)}</span>
                  {lines === 0 && <span className="vsc-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5" style={{ background: C.text }} />}
                </div>
                {OUTPUT.slice(0, lines).map((l, i) => (
                  <div key={i} className="vsc-line whitespace-pre-wrap" style={{ color: l.color ?? C.text }}>
                    {l.text || "\u00a0"}
                  </div>
                ))}
                {done && (
                  <button
                    onClick={close}
                    className="vsc-line mt-3 rounded-sm px-4 py-1.5 font-sans text-[13px] text-white transition-colors hover:bg-[#026ec1]"
                    style={{ background: C.blue, boxShadow: "0 0 18px -4px #0078d4" }}
                  >
                    ⚡ Go Live — Open Portfolio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex h-[22px] shrink-0 items-center justify-between text-[11px] text-white" style={{ background: C.status }}>
          <div className="flex h-full items-center">
            <span className="flex h-full items-center px-2.5" style={{ background: "#16825d" }}>{"><"}</span>
            <span className="flex items-center gap-1 px-2"><GitBranch size={12} /> main*</span>
            <span className="hidden items-center gap-1 px-1 sm:flex"><RefreshCw size={11} /></span>
            <span className="px-2">⨂ 0 ⚠ 0</span>
            {done && <span className="hidden items-center gap-1 px-2 sm:flex"><Radio size={12} /> Port: 8080</span>}
          </div>
          <div className="flex items-center gap-3 px-2">
            <span className="hidden md:inline">Ln {code.length}, Col 2</span>
            <span className="hidden md:inline">Spaces: 2</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span>{lang}</span>
            <span>{done ? "● Go Live" : "◌ Starting…"}</span>
            <Bell size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
