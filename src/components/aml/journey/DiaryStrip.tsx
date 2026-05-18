import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

interface Props {
  lines: string[];
}

/** "Diary" of the last few plain-English log lines, used in Act 2. */
export default function DiaryStrip({ lines }: Props) {
  if (lines.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] italic text-white/35">
        <BookOpen className="h-3 w-3" />
        Her story will start as soon as something happens…
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <BookOpen className="mt-0.5 h-3 w-3 shrink-0 text-state-active/70" />
      <div className="flex flex-col gap-0.5">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => (
            <motion.div
              key={`${i}-${l}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: i === lines.length - 1 ? 1 : 0.5, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] leading-snug text-white/75"
            >
              {l}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
