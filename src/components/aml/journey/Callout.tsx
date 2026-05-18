import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Callout as CalloutData } from "@/lib/aml/productCopy";

interface Props {
  callouts: CalloutData[];
}

export default function Callouts({ callouts }: Props) {
  return (
    <div className="flex w-full flex-col gap-2">
      <AnimatePresence>
        {callouts.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-3 py-2 backdrop-blur",
              c.tone === "alert"
                ? "border-state-alert/40 bg-state-alert/10"
                : "border-yellow-400/40 bg-yellow-400/10",
            )}
          >
            {c.tone === "alert" ? (
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-state-alert" />
            ) : (
              <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-300" />
            )}
            <div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  c.tone === "alert" ? "text-state-alert" : "text-yellow-200",
                )}
              >
                {c.title}
              </div>
              <div className="text-[11px] leading-snug text-white/60">{c.body}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
