import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { links } from "@/data/links";

type Line = { kind: "in" | "out" | "err" | "banner"; text: string };

const BANNER = String.raw`
 __     ___            _
 \ \   / (_)_   _____ | | __
  \ \ / /| \ \ / / _ \| |/ /
   \ V / | |\ V /  __/|   <
    \_/  |_| \_/ \___||_|\_\    v2.1

  Welcome to vivek.os — Interactive Shell.
  Type 'help' for commands. Press ` + "`" + ` to close.
`;

const HELP = [
  "available commands:",
  "  help                 show this help",
  "  about                short bio",
  "  whoami               identity",
  "  skills               tech stack",
  "  projects             list projects",
  "  contact              contact info",
  "  socials              social links",
  "  stats                dsa & platform stats",
  "  edu | education      academic background",
  "  open <target>        open a profile/site (leetcode, github, ...)",
  "  clear                clear the screen",
  "  echo <text>          print text",
  "  date                 current date/time",
  "  sudo <anything>      🙃",
  "  exit                 close shell",
];

const OPEN_TARGETS: Record<string, string> = {
  github: links.github,
  linkedin: links.linkedin,
  leetcode: links.leetcode,
  codeforces: links.codeforces,
  codechef: links.codechef,
  gfg: links.gfg,
  geeksforgeeks: links.gfg,
  hackerrank: links.hackerrank,
  atcoder: links.atcoder,
  x: links.x,
  twitter: links.x,
  instagram: links.instagram,
  youtube: links.youtube,
  email: `mailto:${profile.email}`,
  mail: `mailto:${profile.email}`,
};

export function Shell({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Line[]>([
    { kind: "banner", text: BANNER },
    { kind: "out", text: "Tip: try 'projects', 'skills', or 'open leetcode'." },
  ]);
  const [value, setValue] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const prompt = useMemo(() => "guest@vivek:~$", []);

  const push = (lines: Line[]) => setHistory((h) => [...h, ...lines]);
  const out = (text: string) => ({ kind: "out" as const, text });
  const err = (text: string) => ({ kind: "err" as const, text });

  const run = (raw: string) => {
    const line = raw.trim();
    push([{ kind: "in", text: `${prompt} ${raw}` }]);
    if (!line) return;

    setCmdHistory((h) => [...h, line]);
    setHistoryIdx(null);

    const [cmd, ...rest] = line.split(/\s+/);
    const arg = rest.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
      case "?":
        push(HELP.map(out));
        break;
      case "clear":
      case "cls":
        setHistory([]);
        break;
      case "whoami":
        push([out(profile.name)]);
        break;
      case "about":
        push([
          out(profile.bio),
          out(""),
          out(`location : ${profile.location}`),
          out(`email    : ${profile.email}`),
          out(`status   : open to Software Engineer opportunities`),
        ]);
        break;
      case "skills": {
        const rows: Line[] = [];
        for (const [cat, items] of Object.entries(skills)) {
          rows.push(out(`  [${cat}]`));
          rows.push(out(`    ${items.join(", ")}`));
        }
        push(rows);
        break;
      }
      case "projects": {
        const rows: Line[] = [];
        projects.forEach((p, i) => {
          rows.push(
            out(
              `  ${String(i + 1).padStart(2, "0")}. ${p.title}  [${p.status}]${p.featured ? " ★" : ""}`,
            ),
          );
          rows.push(out(`      ${p.techStack.join(" · ")}`));
          if (p.githubUrl) rows.push(out(`      code: ${p.githubUrl}`));
          if (p.liveUrl) rows.push(out(`      live: ${p.liveUrl}`));
        });
        push(rows);
        break;
      }
      case "contact":
        push([
          out(`email : ${profile.email}`),
          out(`phone : ${profile.phone}`),
          out(`loc   : ${profile.location}`),
          out(`www   : ${links.linkedin}`),
        ]);
        break;
      case "socials":
      case "social":
        push([
          out(`github    : ${links.github}`),
          out(`linkedin  : ${links.linkedin}`),
          out(`leetcode  : ${links.leetcode}`),
          out(`codeforces: ${links.codeforces}`),
          out(`codechef  : ${links.codechef}`),
          out(`gfg       : ${links.gfg}`),
          out(`hackerrank: ${links.hackerrank}`),
        ]);
        break;
      case "stats":
        push([
          out(`dsa problems solved : ${profile.stats.problemsSolved}+`),
          out(`linkedin connections: ${profile.stats.linkedinConnections}+`),
          out(""),
          out(`(live platform stats are shown in the Consistency section)`),
        ]);
        break;
      case "edu":
      case "education":
        push([
          out("B.E. Computer Science & Engineering (Data Science)"),
          out("RNS Institute of Technology, Bengaluru"),
          out("2024 — 2028"),
        ]);
        break;
      case "open": {
        const target = arg.toLowerCase().trim();
        const url = OPEN_TARGETS[target];
        if (!url) {
          push([err(`open: unknown target '${target || "-"}'`), out(`available: ${Object.keys(OPEN_TARGETS).join(", ")}`)]);
        } else {
          push([out(`opening ${target} → ${url}`)]);
          window.open(url, "_blank", "noopener,noreferrer");
        }
        break;
      }
      case "echo":
        push([out(arg)]);
        break;
      case "date":
        push([out(new Date().toString())]);
        break;
      case "sudo":
        push([err("Nice try. Permission denied. This isn't that kind of OS.")]);
        break;
      case "ls":
        push([out("about  skills  projects  education  contact  socials  stats")]);
        break;
      case "pwd":
        push([out("/home/vivek/portfolio")]);
        break;
      case "exit":
      case "quit":
        push([out("bye 👋")]);
        setTimeout(onClose, 200);
        break;
      default:
        push([err(`command not found: ${cmd}. type 'help'.`)]);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const idx = historyIdx === null ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setValue(cmdHistory[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === null) return;
      const idx = historyIdx + 1;
      if (idx >= cmdHistory.length) {
        setHistoryIdx(null);
        setValue("");
      } else {
        setHistoryIdx(idx);
        setValue(cmdHistory[idx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const opts = [
        "help", "about", "whoami", "skills", "projects", "contact",
        "socials", "stats", "education", "open", "clear", "echo",
        "date", "exit",
      ];
      const match = opts.find((o) => o.startsWith(value.trim().toLowerCase()));
      if (match) setValue(match);
    }
  };

  return (
    <div
      className="flex flex-1 flex-col bg-black/70 font-mono text-[13px] leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-foreground/90"
      >
        {history.map((l, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap break-words ${
              l.kind === "in"
                ? "text-[var(--phosphor)]"
                : l.kind === "err"
                  ? "text-red-400"
                  : l.kind === "banner"
                    ? "text-[var(--phosphor)] phosphor-glow"
                    : "text-foreground/85"
            }`}
          >
            {l.text}
          </pre>
        ))}
        {/* Input line */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[var(--phosphor)]">{prompt}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="flex-1 bg-transparent text-foreground caret-[var(--phosphor)] outline-none"
            aria-label="Shell input"
          />
        </div>
      </div>
    </div>
  );
}
