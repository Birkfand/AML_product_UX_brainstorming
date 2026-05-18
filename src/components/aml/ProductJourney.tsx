import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, ShieldQuestion, LogOut, PauseCircle, FileCheck2, Sparkles } from "lucide-react";
import StoryCard from "./journey/StoryCard";
import OnboardingChecklist from "./journey/OnboardingChecklist";
import RiskScoreBadge from "./journey/RiskScoreBadge";
import DiaryStrip from "./journey/DiaryStrip";
import AngelaFigure from "./persona/AngelaFigure";
import Act2Loop from "./journey/Act2Loop";
import Callouts from "./journey/Callout";
import {
  additionalResponse,
  aiActive,
  callouts,
  currentAct,
  exitOnHold,
  exitReady,
  onboardingChecklist,
  recentDiary,
  riskBadge,
} from "@/lib/aml/productCopy";
import type { FlowState } from "@/lib/aml/reducer";
import { cn } from "@/lib/utils";

interface Props {
  state: FlowState;
}

export default function ProductJourney({ state }: Props) {
  const act = currentAct(state);
  const outcomes = callouts(state);

  return (
    <div className="absolute inset-0 overflow-hidden px-6 pt-24 pb-6">
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-3">
        {/* Persona banner */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-popover/60 px-4 py-2.5 backdrop-blur">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-state-active/15 text-state-active">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Following</div>
            <div className="text-sm font-semibold text-white">Angela Martins · new customer</div>
          </div>
          <div className="hidden text-right text-[11px] text-white/50 md:block">
            Story on the left · journey on the right.
          </div>
        </div>

        {outcomes.length > 0 && <Callouts callouts={outcomes} />}

        {/* 2-column body: story (left) · user flow (right, main focus) */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(320px,400px)_1fr]">
          {/* LEFT — Story card stack */}
          <div className="min-h-0 overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={act}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {act === "establish" && <EstablishStory state={state} />}
                {act === "ongoing" && <OngoingStory state={state} />}
                {act === "exit" && <ExitStory state={state} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT — User flow (main focus) */}
          <div className="relative min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-popover/40 backdrop-blur">
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              <div className="rounded-full border border-white/10 bg-popover/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-state-active/80">
                User flow
              </div>
              <ActPill act={act} />
            </div>
            <div className="flex h-full items-center justify-center p-6">
              <Act2Loop state={state} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Story panels per act ---------- */

function EstablishStory({ state }: { state: FlowState }) {
  const items = onboardingChecklist(state);
  const risk = riskBadge(state);
  const eddActive = state.nodeStates.kycCase === "alert";
  const detailLive = state.nodeStates.crr !== "idle";

  return (
    <StoryCard
      act="Act 1"
      title="Becoming a customer"
      subtitle="Angela tells us about herself."
      tone={eddActive ? "alert" : "neutral"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <AngelaFigure pose="walking" size={80} label="Angela" />
          <RiskScoreBadge data={risk} />
        </div>

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

        <AnimatePresence>
          {eddActive && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-lg border border-state-alert/40 bg-state-alert/10 px-3 py-2"
            >
              <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0 text-state-alert" />
              <div>
                <div className="text-[11px] font-semibold text-state-alert">Enhanced review opened</div>
                <div className="text-[11px] text-white/65">
                  A human reviewer is taking a closer look before Angela is fully welcomed.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StoryCard>
  );
}

function OngoingStory({ state }: { state: FlowState }) {
  const diary = recentDiary(state, 4);
  const tmAlert = state.nodeStates.tm === "alert";
  const ai = aiActive(state);

  return (
    <StoryCard
      act="Act 2"
      title="Living as a customer"
      subtitle="We keep watching — this never stops."
      tone={tmAlert ? "alert" : "neutral"}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AngelaFigure pose="standing" size={72} label="" />
          <div className="text-[12px] text-white/70">
            Angela is using her account. In the background we're watching every transaction.
          </div>
        </div>

        <AnimatePresence>
          {tmAlert && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-state-alert/40 bg-state-alert/10 px-3 py-2 text-[11px] text-state-alert"
            >
              <div className="font-semibold">Wait — something doesn't look right.</div>
              <div className="text-state-alert/80">A pattern in Angela's recent activity tripped our rules.</div>
            </motion.div>
          )}
        </AnimatePresence>

        <DiaryStrip lines={diary} />

        <div className="flex items-center gap-1.5 text-[11px]">
          <Sparkles className={cn("h-3 w-3 transition-colors", ai ? "text-state-ai" : "text-white/30")} />
          <span className={cn("transition-colors", ai ? "text-state-ai/90" : "text-white/40")}>
            {ai ? "AI is helping the team focus" : "AI quietly watches in the background"}
          </span>
        </div>
      </div>
    </StoryCard>
  );
}

function ExitStory({ state }: { state: FlowState }) {
  const ready = exitReady(state);
  const onHold = !ready && exitOnHold(state);
  const Icon = onHold ? PauseCircle : ready ? LogOut : FileCheck2;
  const title = ready ? "A clean goodbye" : onHold ? "We can't say goodbye yet" : "Offboarding";
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
        <div className={cn("transition-transform duration-500", ready ? "translate-x-2" : "")}>
          <AngelaFigure pose={ready ? "leaving" : "standing"} size={72} label="" />
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

function ActPill({ act }: { act: ReturnType<typeof currentAct> }) {
  const label =
    act === "establish" ? "Act 1 · Becoming a customer" : act === "ongoing" ? "Act 2 · Living as a customer" : "Act 3 · Offboarding";
  return (
    <div className="rounded-full border border-white/10 bg-popover/80 px-2.5 py-1 text-[10px] font-medium text-white/70">
      {label}
    </div>
  );
}
