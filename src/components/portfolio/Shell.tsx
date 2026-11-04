import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { links } from "@/data/links";

type Line = { kind: "in" | "out" | "err" | "banner"; text: string };
const QUICK_COMMANDS = ["help", "whoami", "skills", "projects", "stats", "open leetcode", "contact", "clear"];
const HELP = "Commands: help, whoami/about, skills, projects, stats, open <github|linkedin|leetcode|codeforces|codechef|gfg>, contact, clear, exit";
const OPEN_TARGETS: Record<string, string> = { github: links.github, linkedin: links.linkedin, leetcode: links.leetcode, codeforces: links.codeforces, codechef: links.codechef, gfg: links.gfg };

export function Shell({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Line[]>([{ kind: "banner", text: "vivek.os · developer console v2.0\nWelcome. Type 'help' or choose a command below." }]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [history]);

  const run = (raw: string) => {
    const line = raw.trim();
    if (!line) return;
    const out: Line[] = [{ kind: "in", text: `vivek@portfolio:~$ ${line}` }];
    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();
    const say = (...texts: string[]) => out.push(...texts.map((text) => ({ kind: "out" as const, text })));
    switch (cmd?.toLowerCase()) {
      case "help": say(HELP); break;
      case "whoami": case "about": say(profile.name, profile.bio); break;
      case "skills": for (const [group, items] of Object.entries(skills)) say(`${group}: ${items.join(", ")}`); break;
      case "projects": for (const project of projects.filter((item) => item.featured)) say(`${project.title} · ${project.techStack.join(" · ")}`); break;
      case "stats": say(`DSA problems solved: ${profile.stats.problemsSolved}+`, `LinkedIn connections: ${profile.stats.linkedinConnections.toLocaleString()}+`); break;
      case "contact": say(profile.email); break;
      case "open": { const url = OPEN_TARGETS[arg]; if (url) { say(`Opening ${arg}…`); window.open(url, "_blank", "noopener,noreferrer"); } else out.push({ kind: "err", text: `Unknown target. Available: ${Object.keys(OPEN_TARGETS).join(", ")}` }); break; }
      case "clear": setHistory([]); return;
      case "exit": setHistory((previous) => [...previous, ...out, { kind: "out", text: "Closing console…" }]); onClose(); return;
      default: out.push({ kind: "err", text: `Command not found: ${cmd}. Type 'help'.` });
    }
    setHistory((previous) => [...previous, ...out]);
  };
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") { run(value); setValue(""); } };

  return <div className="flex min-h-0 flex-1 flex-col font-mono text-[13px] leading-relaxed text-[#c8f5d0]" onClick={() => inputRef.current?.focus()}>
    <div
      ref={scrollRef}
      data-lenis-prevent
      onWheel={(event) => event.stopPropagation()}
      className="term-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
    >
      {history.map((line, index) => <pre key={index} className={`whitespace-pre-wrap break-words ${line.kind === "in" ? "text-[#4ade80]" : line.kind === "err" ? "text-[#f87171]" : line.kind === "banner" ? "font-semibold text-[#e2ffe8]" : "text-[#c8f5d0]"}`}>{line.text}</pre>)}
      <div className="mt-2 flex items-center gap-2"><span className="shrink-0 text-[#4ade80]">vivek@portfolio:~$</span><input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={onKey} spellCheck={false} autoCapitalize="off" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-[#f0fdf4] caret-[#4ade80] outline-none" aria-label="Shell input" /></div>
      <div className="mt-3 flex flex-wrap gap-2">{QUICK_COMMANDS.map((command) => <button key={command} type="button" onClick={() => { run(command); setValue(""); }} className="rounded-md border border-[#224e33] bg-[#132a1e] px-2 py-1 font-mono text-[11px] text-[#a7f3d0] transition-colors hover:border-[#34d399] hover:bg-[#1a3d2c] hover:text-[#f0fdf4]">{command}</button>)}</div>
    </div>
  </div>;
}


/** Global keyboard and event entry point for the console modal. */
export function ShellHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (event.key === "`" && !typing) { event.preventDefault(); setOpen((value) => !value); }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("shell:open", onOpen);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("shell:open", onOpen); };
  }, []);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <div role="dialog" aria-modal="true" aria-label="Interactive developer console" className="flex h-[min(640px,85vh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
        <div className="text-[11px] font-medium text-muted-foreground">vivek.os · developer console v2.0</div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Close console">×</button>
      </div>
      <Shell onClose={() => setOpen(false)} />
    </div>
  </div>;
}
