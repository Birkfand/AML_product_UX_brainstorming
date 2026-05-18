import { LogOut, PauseCircle, FileCheck2 } from "lucide-react";
import StoryCard from "./StoryCard";
import AngelaFigure from "../persona/AngelaFigure";
import { exitOnHold, exitReady } from "@/lib/aml/productCopy";
import type { FlowState } from "@/lib/aml/reducer";
import { cn } from "@/lib/utils";

interface Props {
  state: FlowState;
}

export default function Act3Exit({ state }: Props) {
  const ready = exitReady(state);
  const onHold = !ready && exitOnHold(state);
  const Icon = onHold ? PauseCircle : ready ? LogOut : FileCheck2;
  const title = ready
    ? "A clean goodbye"
    : onHold
      ? "We can't say goodbye yet"
      : "Offboarding";
  const blurb = ready
    ? "Angela leaves on good terms. Records retained for 5 years."
    : onHold
      ? "An open case must close before the relationship ends."
      : "When the time comes, we'll wrap things up cleanly.";

  return (
    <StoryCard
      act="Act 3"
      title={onHold ? "On hold" : "Customer offboards"}
      subtitle="The final page of Angela's story."
      tone={onHold ? "alert" : "neutral"}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "transition-transform duration-500",
            ready ? "translate-x-2" : "",
          )}
        >
          <AngelaFigure
            pose={ready ? "leaving" : "standing"}
            size={72}
            label=""
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              ready
                ? "border-state-complete/40 bg-state-complete/10 text-state-complete"
                : onHold
                  ? "border-state-alert/40 bg-state-alert/10 text-state-alert"
                  : "border-white/15 bg-white/5 text-white/55",
            )}
          >
            <Icon className="h-3 w-3" />
            {title}
          </div>
          <p className="text-[11px] leading-snug text-white/65">{blurb}</p>
        </div>
      </div>
    </StoryCard>
  );
}
