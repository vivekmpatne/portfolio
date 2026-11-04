import { useEffect, useMemo, useState } from "react";
import { Shell as ShellIcon, X } from "lucide-react";
import { Shell } from "./Shell";

/**
 * Bottom-right SHELL launcher + panel (opens the interactive Shell).
 * Backtick (`) toggles the shell.
 */
export function TerminalOverlay() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      {/* SHELL launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-16 right-4 z-40 flex items-center gap-2 border border-[var(--phosphor)]/60 bg-background/90 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--phosphor)] backdrop-blur-sm transition-all hover:bg-[var(--phosphor)]/10 hover:shadow-[0_0_20px_-4px_var(--phosphor)]"
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
    <div
      data-lenis-prevent
      onWheel={(event) => event.stopPropagation()}
      className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col border border-[var(--phosphor)]/70 bg-[#0d1f16] shadow-[0_0_60px_-10px_var(--phosphor)] backdrop-blur-md md:inset-x-auto md:right-4 md:bottom-4 md:top-auto md:h-[540px] md:w-[520px]"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[var(--phosphor)]/40 bg-[#132a1e] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="text-[11px] uppercase tracking-widest" style={{ color: "#b8ffcc" }}>
          guest@vivek:~ — {created}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="hover:opacity-100"
          style={{ color: "#b8ffcc" }}
          aria-label="Close shell"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Shell onClose={onClose} />
    </div>
  );
}
