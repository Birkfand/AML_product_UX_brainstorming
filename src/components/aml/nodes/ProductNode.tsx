import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ProductNodeData } from "@/lib/aml/graph";
import type { NodeStatus } from "@/lib/aml/types";
import { cn } from "@/lib/utils";

export interface ProductNodeProps extends NodeProps {
  data: ProductNodeData & { status: NodeStatus; statusText: string };
}

const statusStyles: Record<NodeStatus, { border: string; glow: string; iconBg: string; dot: string; text: string }> = {
  idle: {
    border: "border-white/10",
    glow: "shadow-none",
    iconBg: "bg-white/5 text-white/60",
    dot: "bg-state-idle",
    text: "text-white/50",
  },
  active: {
    border: "border-state-active/60",
    glow: "shadow-[0_0_0_1px_var(--state-active),0_0_30px_-5px_var(--state-active)]",
    iconBg: "bg-state-active/15 text-state-active",
    dot: "bg-state-active",
    text: "text-state-active",
  },
  processing: {
    border: "border-state-active/60",
    glow: "shadow-[0_0_0_1px_var(--state-active),0_0_30px_-5px_var(--state-active)]",
    iconBg: "bg-state-active/15 text-state-active",
    dot: "bg-state-active",
    text: "text-state-active",
  },
  complete: {
    border: "border-state-complete/50",
    glow: "shadow-[0_0_0_1px_var(--state-complete),0_0_28px_-8px_var(--state-complete)]",
    iconBg: "bg-state-complete/15 text-state-complete",
    dot: "bg-state-complete",
    text: "text-state-complete",
  },
  alert: {
    border: "border-state-alert/70",
    glow: "shadow-[0_0_0_1px_var(--state-alert),0_0_32px_-4px_var(--state-alert)]",
    iconBg: "bg-state-alert/15 text-state-alert",
    dot: "bg-state-alert",
    text: "text-state-alert",
  },
};

export default function ProductNode({ data }: ProductNodeProps) {
  const Icon = data.icon;
  const isAi = data.variant === "ai";
  const status: NodeStatus = data.status ?? "idle";
  const s = isAi && status === "active"
    ? {
        border: "border-state-ai/70",
        glow: "shadow-[0_0_0_1px_var(--state-ai),0_0_36px_-4px_var(--state-ai)]",
        iconBg: "bg-state-ai/15 text-state-ai",
        dot: "bg-state-ai",
        text: "text-state-ai",
      }
    : isAi && status === "complete"
    ? {
        border: "border-state-ai/50",
        glow: "shadow-[0_0_0_1px_var(--state-ai),0_0_28px_-8px_var(--state-ai)]",
        iconBg: "bg-state-ai/15 text-state-ai",
        dot: "bg-state-ai",
        text: "text-state-ai",
      }
    : statusStyles[status];

  const pulsing = status === "active" || status === "processing" || status === "alert";

  return (
    <Popover>
      <Handle type="target" position={Position.Left} className="!opacity-60" />
      <PopoverTrigger asChild>
        <motion.div
          initial={false}
          animate={{ scale: pulsing ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 1.4, repeat: pulsing ? Infinity : 0 }}
          className={cn(
            "glass-card relative rounded-xl border px-4 py-3 transition-all duration-300 cursor-pointer select-none",
            isAi ? "w-[280px]" : "w-[220px]",
            s.border,
            s.glow,
          )}
        >
          <AnimatePresence>
            {pulsing && (
              <motion.span
                key="ring"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-xl border",
                  isAi ? "border-state-ai/60" : status === "alert" ? "border-state-alert/60" : "border-state-active/60",
                )}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.iconBg)}>
              <Icon className="h-4.5 w-4.5" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white/90">{data.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                <span className={cn("truncate font-mono text-[10px] uppercase tracking-wider", s.text)}>
                  {data.statusText || "idle"}
                </span>
              </div>
            </div>
          </div>
          {isAi && (
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-state-ai/70">
              Intelligence Overlay
            </div>
          )}
        </motion.div>
      </PopoverTrigger>

      <PopoverContent side="top" className="w-72 border-white/10 bg-popover/95 backdrop-blur">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold text-white">{data.title}</div>
            <div className="text-xs text-white/50">Click anywhere else to close</div>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              Consumes
            </div>
            <ul className="space-y-1">
              {data.consumes.map((c) => (
                <li key={c} className="flex gap-2 text-xs text-white/80">
                  <span className="text-state-active">↳</span>{c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
              Outputs
            </div>
            <ul className="space-y-1">
              {data.outputs.map((c) => (
                <li key={c} className="flex gap-2 text-xs text-white/80">
                  <span className="text-state-complete">→</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PopoverContent>

      <Handle type="source" position={Position.Right} className="!opacity-60" />
    </Popover>
  );
}
