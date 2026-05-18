import { RotateCcw, ChevronRight, ShieldAlert, ShieldCheck, ShieldQuestion, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioId } from "@/lib/aml/types";

interface Props {
  activeScenario: ScenarioId | null;
  isPlaying: boolean;
  canStep: boolean;
  stepIndex: number;
  totalSteps: number;
  onStart: (id: ScenarioId) => void;
  onNextStep: () => void;
  onReset: () => void;
}

const buttons: { id: ScenarioId; label: string; icon: typeof ShieldCheck; tone: string; ring: string }[] = [
  { id: "standard",   label: "Standard Onboarding",   icon: ShieldCheck,    tone: "text-state-complete", ring: "ring-state-complete/60 shadow-[0_0_24px_-6px_var(--state-complete)]" },
  { id: "pep",        label: "PEP Customer",          icon: ShieldQuestion, tone: "text-yellow-300",     ring: "ring-yellow-400/60 shadow-[0_0_24px_-6px_oklch(0.78_0.16_75)]" },
  { id: "suspicious", label: "Suspicious Transaction", icon: ShieldAlert,   tone: "text-state-alert",    ring: "ring-state-alert/70 shadow-[0_0_26px_-6px_var(--state-alert)]" },
  { id: "periodic",   label: "Periodic Renewal",       icon: RefreshCw,     tone: "text-state-active",   ring: "ring-state-active/60 shadow-[0_0_24px_-6px_var(--state-active)]" },
];

const dots: Record<ScenarioId, string> = {
  standard:   "bg-state-complete",
  pep:        "bg-yellow-400",
  suspicious: "bg-state-alert",
  periodic:   "bg-state-active",
};

export default function ScenarioBar({ activeScenario, canStep, stepIndex, totalSteps, onStart, onNextStep, onReset }: Props) {
  const armed = !!activeScenario;
  const finished = armed && stepIndex >= totalSteps;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((b) => {
        const Icon = b.icon;
        const active = activeScenario === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onStart(b.id)}
            className={cn(
              "group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 backdrop-blur transition-all hover:bg-white/[0.06]",
              active && "ring-1 bg-white/[0.06]",
              active && b.ring,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", dots[b.id])} />
            <Icon className={cn("h-3.5 w-3.5", b.tone)} />
            {b.label}
          </button>
        );
      })}

      <div className="mx-1 h-6 w-px bg-white/10" />

      <button
        onClick={onNextStep}
        disabled={!canStep}
        title="Next step (→ or Space)"
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold backdrop-blur transition-all disabled:cursor-not-allowed disabled:opacity-40",
          canStep
            ? "border-state-active/60 bg-state-active/15 text-white shadow-[0_0_22px_-6px_var(--state-active)] hover:bg-state-active/25 animate-pulse"
            : "border-white/10 bg-white/[0.03] text-white/80",
        )}
      >
        <ChevronRight className="h-3.5 w-3.5" />
        Next
        {armed && (
          <span className="ml-1 rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
            {stepIndex}/{totalSteps}
          </span>
        )}
      </button>
      <button
        onClick={onReset}
        title="Reset (R)"
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 backdrop-blur transition-all hover:bg-white/[0.06]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </button>

      {armed && !finished && (
        <span className="ml-2 hidden items-center gap-1.5 text-[11px] text-white/45 md:flex">
          <Sparkles className="h-3 w-3 text-state-active/70" />
          Click Next (or press →) to advance
        </span>
      )}
      {finished && (
        <span className="ml-2 hidden items-center gap-1.5 text-[11px] text-state-complete/80 md:flex">
          <ShieldCheck className="h-3 w-3" />
          Scenario complete
        </span>
      )}
    </div>
  );
}
