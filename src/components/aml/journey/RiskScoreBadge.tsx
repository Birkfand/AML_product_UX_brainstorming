import { motion } from "framer-motion";
import type { RiskBadgeData } from "@/lib/aml/productCopy";
import { cn } from "@/lib/utils";

interface Props {
  data: RiskBadgeData;
}

const TONE: Record<RiskBadgeData["tone"], { ring: string; text: string; glow: string }> = {
  pending: {
    ring: "border-white/20",
    text: "text-white/40",
    glow: "",
  },
  low: {
    ring: "border-state-complete",
    text: "text-state-complete",
    glow: "shadow-[0_0_28px_-8px_var(--state-complete)]",
  },
  medium: {
    ring: "border-yellow-400",
    text: "text-yellow-300",
    glow: "shadow-[0_0_28px_-8px_rgb(250,204,21)]",
  },
  review: {
    ring: "border-state-alert",
    text: "text-state-alert",
    glow: "shadow-[0_0_28px_-8px_var(--state-alert)]",
  },
};

export default function RiskScoreBadge({ data }: Props) {
  const tone = TONE[data.tone];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
        Risk score
      </div>
      <motion.div
        key={`${data.tone}-${data.score ?? "p"}`}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full border-2 bg-popover/80 font-semibold transition-colors",
          tone.ring,
          tone.glow,
        )}
      >
        <span className={cn("text-lg leading-none", tone.text)}>
          {data.score ?? "—"}
        </span>
        {data.tone === "review" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-state-alert/20" />
        )}
      </motion.div>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", tone.text)}>
        {data.label}
      </div>
    </div>
  );
}
