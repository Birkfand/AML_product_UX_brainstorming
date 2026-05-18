import { motion, AnimatePresence } from "framer-motion";
import { ShieldQuestion } from "lucide-react";
import StoryCard from "./StoryCard";
import OnboardingChecklist from "./OnboardingChecklist";
import RiskScoreBadge from "./RiskScoreBadge";
import AngelaFigure from "../persona/AngelaFigure";
import { additionalResponse, onboardingChecklist, riskBadge } from "@/lib/aml/productCopy";
import type { FlowState } from "@/lib/aml/reducer";

interface Props {
  state: FlowState;
}

export default function Act1Establish({ state }: Props) {
  const items = onboardingChecklist(state);
  const risk = riskBadge(state);
  const eddActive = state.nodeStates.kycCase === "alert";
  // The "additional response" detail is the human beat — surface it once CRR engages.
  const detailLive = state.nodeStates.crr !== "idle";

  return (
    <StoryCard
      act="Act 1"
      title="Becoming a customer"
      subtitle="Angela tells us about herself."
      tone={eddActive ? "alert" : "neutral"}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-5">
        {/* Portrait */}
        <div className="flex flex-col items-center">
          <AngelaFigure pose="walking" size={88} label="Angela" />
        </div>

        {/* Checklist + additional response */}
        <div className="flex flex-col gap-3">
          <OnboardingChecklist items={items} />

          <motion.div
            initial={false}
            animate={{ opacity: detailLive ? 1 : 0.55 }}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Additional response
            </div>
            <div className="mt-1 text-[11px] text-white/70">{additionalResponse.prompt}</div>
            <div className="text-[11px] font-semibold text-state-complete">{additionalResponse.answer}</div>
            <div className="mt-0.5 text-[11px] text-white/75">
              <span className="text-white/50">Details: </span>
              <span className={detailLive ? "text-state-active" : "text-white/60"}>
                {additionalResponse.detail}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Risk score */}
        <RiskScoreBadge data={risk} />
      </div>

      <AnimatePresence>
        {eddActive && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg border border-state-alert/40 bg-state-alert/10 px-3 py-2"
          >
            <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0 text-state-alert" />
            <div>
              <div className="text-[11px] font-semibold text-state-alert">
                Enhanced review opened
              </div>
              <div className="text-[11px] text-white/65">
                A human reviewer is taking a closer look at Angela's profile before she's
                fully welcomed.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StoryCard>
  );
}
