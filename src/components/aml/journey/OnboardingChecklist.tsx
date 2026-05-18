import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";
import type { ChecklistItem } from "@/lib/aml/productCopy";
import { cn } from "@/lib/utils";

interface Props {
  items: ChecklistItem[];
  title?: string;
}

export default function OnboardingChecklist({ items, title = "Onboarding questions" }: Props) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
        {title}
      </div>
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li
              key={it.key}
              layout
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[12px]"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  it.ticked
                    ? "border-state-complete bg-state-complete/20 text-state-complete"
                    : it.active
                      ? "border-state-active/70 text-state-active"
                      : "border-white/15 text-white/30",
                )}
              >
                {it.ticked ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : it.active ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <Circle className="h-1 w-1 fill-current" />
                )}
              </span>
              <span
                className={cn(
                  "transition-colors",
                  it.ticked
                    ? "text-white/85"
                    : it.active
                      ? "text-white/80"
                      : "text-white/35",
                )}
              >
                {it.label}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
