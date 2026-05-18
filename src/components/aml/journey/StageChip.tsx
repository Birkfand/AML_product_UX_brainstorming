import { motion } from "framer-motion";
import { Check, Clock, Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageStatus } from "@/lib/aml/productCopy";

interface Props {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status: StageStatus;
  /** Optional small footnote shown beneath (e.g. derived outcome) */
  caption?: string;
  size?: "sm" | "md";
}

const statusMeta: Record<StageStatus, { label: string; chip: string; icon: React.ComponentType<{ className?: string }>; ring: string; iconGlow: string }> = {
  waiting: {
    label: "Waiting",
    chip: "bg-white/5 text-white/40 border-white/10",
    icon: Clock,
    ring: "border-white/10",
    iconGlow: "text-white/40",
  },
  in_progress: {
    label: "In progress",
    chip: "bg-state-active/15 text-state-active border-state-active/30",
    icon: Loader2,
    ring: "border-state-active/50 shadow-[0_0_22px_-6px_var(--state-active)]",
    iconGlow: "text-state-active",
  },
  done: {
    label: "Done",
    chip: "bg-state-complete/15 text-state-complete border-state-complete/30",
    icon: Check,
    ring: "border-state-complete/40",
    iconGlow: "text-state-complete",
  },
  review: {
    label: "Needs review",
    chip: "bg-state-alert/15 text-state-alert border-state-alert/40",
    icon: ShieldAlert,
    ring: "border-state-alert/50 shadow-[0_0_24px_-6px_var(--state-alert)]",
    iconGlow: "text-state-alert",
  },
};

export default function StageChip({ icon: Icon, title, status, caption, size = "md" }: Props) {
  const m = statusMeta[status];
  const StatusIcon = m.icon;
  const ring = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1.5 text-center"
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 bg-popover/80 backdrop-blur transition-all",
          ring,
          m.ring,
        )}
      >
        <Icon className={cn(iconSize, m.iconGlow)} />
        {status === "in_progress" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-state-active/20" />
        )}
      </div>
      <div className={cn("font-medium text-white/90", size === "sm" ? "text-[11px]" : "text-xs")}>
        {title}
      </div>
      <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium", m.chip)}>
        <StatusIcon className={cn("h-2.5 w-2.5", status === "in_progress" && "animate-spin")} />
        {m.label}
      </span>
      {caption && (
        <div className="font-mono text-[9px] uppercase tracking-wider text-white/50">{caption}</div>
      )}
    </motion.div>
  );
}
