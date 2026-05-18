import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/lib/aml/types";

const levelMeta: Record<LogLevel, { icon: string; color: string; bar: string }> = {
  trigger:    { icon: "⚡", color: "text-state-active",  bar: "bg-state-active" },
  success:    { icon: "✅", color: "text-state-complete",bar: "bg-state-complete" },
  processing: { icon: "🔄", color: "text-yellow-300",    bar: "bg-yellow-400" },
  warn:       { icon: "⚠️", color: "text-orange-300",    bar: "bg-orange-400" },
  alert:      { icon: "🔴", color: "text-state-alert",   bar: "bg-state-alert" },
};

interface Props {
  log: LogEntry[];
  open: boolean;
  onToggle: () => void;
  rewrite?: (entry: LogEntry) => LogEntry;
  title?: string;
}

export default function EventLogPanel({ log, open, onToggle, rewrite, title = "Event Log" }: Props) {
  const displayLog = rewrite ? log.map(rewrite) : log;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  return (
    <>
      {/* Toggle handle when closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="open-btn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={onToggle}
            className="absolute right-4 top-20 z-20 flex items-center gap-2 rounded-lg border border-white/10 bg-popover/90 px-3 py-2 text-xs text-white/80 backdrop-blur hover:bg-popover"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Event log
            {log.length > 0 && (
              <span className="ml-1 rounded-full bg-state-active/20 px-1.5 text-[10px] font-medium text-state-active">
                {log.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute right-4 top-20 bottom-6 z-20 flex w-[360px] flex-col rounded-xl border border-white/10 bg-popover/95 backdrop-blur-xl shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">Live</div>
                <div className="text-sm font-semibold text-white">{title}</div>
              </div>
              <button
                onClick={onToggle}
                className="rounded-md p-1.5 text-white/50 hover:bg-white/5 hover:text-white"
                aria-label="Close event log"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
              {displayLog.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-xs text-white/40">
                  Trigger a scenario to see <br /> live compliance events.
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {displayLog.map((e) => {
                    const m = levelMeta[e.level];
                    return (
                      <motion.li
                        key={e.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative flex gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2"
                      >
                        <span className={cn("absolute left-0 top-0 h-full w-[2px] rounded-l", m.bar)} />
                        <span className="font-mono text-[10px] text-white/40">{e.time}</span>
                        <span className="text-sm leading-none">{m.icon}</span>
                        <span className={cn("flex-1 text-xs leading-snug", m.color)}>
                          {e.text}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
