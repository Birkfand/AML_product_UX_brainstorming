import { FileText, ScanFace, Scale, Check, Eye, RefreshCw, Siren, LogOut, ShieldQuestion } from "lucide-react";
import type { FlowState } from "./reducer";
import type { LogEntry, NodeId, NodeStatus } from "./types";

export type StageStatus = "waiting" | "in_progress" | "done" | "review";

/* ------------------------------------------------------------------
 * Act 1 — Customer Establishment (linear)
 * ------------------------------------------------------------------ */

export interface Act1Stage {
  key: string;
  title: string;
  icon: typeof FileText;
  drivers: NodeId[];
}

export const act1Stages: Act1Stage[] = [
  { key: "apply",   title: "Apply",          icon: FileText, drivers: ["onboarding"] },
  { key: "verify",  title: "Verify identity", icon: ScanFace, drivers: ["kyc"] },
  { key: "risk",    title: "Risk check",     icon: Scale,    drivers: ["crr"] },
  { key: "welcome", title: "Welcome",        icon: Check,    drivers: ["onboarding", "kyc", "crr"] },
];

export const eddBranch = {
  title: "Enhanced review",
  icon: ShieldQuestion,
};

export function stageStatusFor(drivers: NodeId[], nodeStates: Record<NodeId, NodeStatus>, opts?: { allMustComplete?: boolean }): StageStatus {
  const states = drivers.map((d) => nodeStates[d]);
  if (opts?.allMustComplete) {
    // Welcome-style "summary" stage: only completes when every driver completes.
    // Upstream alerts don't make Welcome itself "needs review" — they just keep it waiting.
    if (states.every((s) => s === "complete")) return "done";
    if (states.some((s) => s === "alert")) return "waiting";
    if (states.some((s) => s === "active" || s === "processing" || s === "complete")) return "in_progress";
    return "waiting";
  }
  if (states.some((s) => s === "alert")) return "review";
  if (states.some((s) => s === "active" || s === "processing")) return "in_progress";
  if (states.every((s) => s === "complete")) return "done";
  return "waiting";
}

/* ------------------------------------------------------------------
 * Act 2 — Ongoing relationship (cyclical loop)
 * ------------------------------------------------------------------ */

export interface LoopStation {
  key: "watch" | "review" | "investigate";
  title: string;
  icon: typeof Eye;
  /** angle in degrees on the orbit (0 = top, clockwise) */
  angle: number;
}

export const loopStations: LoopStation[] = [
  { key: "watch",       title: "Watch behaviour",   icon: Eye,       angle: 0 },
  { key: "review",      title: "Periodic review",   icon: RefreshCw, angle: 120 },
  { key: "investigate", title: "Investigate & report", icon: Siren,  angle: 240 },
];

export function loopStationStatus(key: LoopStation["key"], state: FlowState): StageStatus {
  switch (key) {
    case "watch":
      if (state.nodeStates.tm === "alert") return "review";
      if (state.nodeStates.tm === "active" || state.nodeStates.tm === "processing") return "in_progress";
      if (state.nodeStates.tm === "complete") return "done";
      return "waiting";
    case "review":
      if (state.nodeStates.kycCase === "complete") return "done";
      if (state.nodeStates.kycCase === "active" || state.nodeStates.kycCase === "processing") return "in_progress";
      if (state.nodeStates.kyc === "complete" && state.nodeStates.tm !== "idle") return "done";
      return "waiting";
    case "investigate":
      if (state.nodeStates.amlCase === "alert") return "review";
      return "waiting";
  }
}

/* ------------------------------------------------------------------
 * Act resolution + persona pose
 * ------------------------------------------------------------------ */

export type ActId = "establish" | "ongoing" | "exit";

export function currentAct(state: FlowState): ActId {
  const ns = state.nodeStates;
  const ongoingTouched = ns.tm !== "idle" || ns.amlCase !== "idle" || ns.kycCase !== "idle";
  if (!ongoingTouched) return "establish";
  // Only enter "exit" act when truly ready to offboard — on-hold cases stay in ongoing.
  if (exitReady(state)) return "exit";
  return "ongoing";
}

export function exitReady(state: FlowState): boolean {
  // Only the standard scenario fully completes onto exit
  if (!state.activeScenario) return false;
  if (state.activeScenario !== "standard") return false;
  return (
    state.nodeStates.tm === "complete" &&
    state.nodeStates.crr === "complete" &&
    state.nodeStates.kyc === "complete"
  );
}

export function exitOnHold(state: FlowState): boolean {
  return state.nodeStates.amlCase === "alert" || state.nodeStates.kycCase === "alert";
}

export type AngelaPose = "walking" | "standing" | "leaving";

export function personaPose(state: FlowState): AngelaPose {
  const act = currentAct(state);
  if (act === "establish") return "walking";
  if (act === "ongoing") return "standing";
  return exitReady(state) ? "leaving" : "standing";
}

/**
 * Where Angela should be on the orbit (degrees, 0 = top, clockwise).
 * Act 1 walks her along the top-left arc into the loop entry (0°).
 * Act 2 snaps her to the most-severe active station.
 * Act 3 ready → back to 270° (she walks off the ring).
 */
export function personaAngle(state: FlowState): number {
  const ns = state.nodeStates;
  const act = currentAct(state);

  if (act === "establish") {
    if (ns.crr === "complete" || ns.crr === "active" || ns.crr === "processing") return 360;
    if (ns.kyc === "complete" || ns.kyc === "active" || ns.kyc === "processing") return 330;
    if (ns.onboarding === "complete" || ns.onboarding === "active" || ns.onboarding === "processing") return 300;
    return 270;
  }

  if (act === "ongoing") {
    // Highest severity wins: alert > in_progress > done
    const watch = loopStationStatus("watch", state);
    const review = loopStationStatus("review", state);
    const investigate = loopStationStatus("investigate", state);
    const score = (s: ReturnType<typeof loopStationStatus>) =>
      s === "review" ? 3 : s === "in_progress" ? 2 : s === "done" ? 1 : 0;
    const ranked = [
      { angle: 240, s: investigate },
      { angle: 120, s: review },
      { angle: 0, s: watch },
    ].sort((a, b) => score(b.s) - score(a.s));
    return ranked[0].s !== "waiting" ? ranked[0].angle : 0;
  }

  // exit
  if (exitReady(state)) return 270;
  if (ns.amlCase === "alert") return 240;
  if (ns.kycCase === "alert") return 120;
  return 0;
}

/* ------------------------------------------------------------------
 * Callouts
 * ------------------------------------------------------------------ */

export interface Callout {
  id: string;
  tone: "warn" | "alert";
  title: string;
  body: string;
}

export function callouts(state: FlowState): Callout[] {
  const out: Callout[] = [];
  if (state.nodeStates.kycCase === "alert" || state.nodeStates.kycCase === "active") {
    out.push({
      id: "edd",
      tone: "warn",
      title: "Extra review opened for Angela",
      body: "A reviewer is taking a closer look at her profile.",
    });
  }
  if (state.nodeStates.amlCase === "alert") {
    out.push({
      id: "sar",
      tone: "alert",
      title: "We've flagged Angela's account",
      body: "An investigator is reviewing and we may notify the regulator.",
    });
  }
  return out;
}

export function aiActive(state: FlowState): boolean {
  return state.nodeStates.ai === "active" || state.nodeStates.ai === "complete";
}

/* ------------------------------------------------------------------
 * Story-card data — onboarding checklist, additional response, risk badge
 * ------------------------------------------------------------------ */

export interface ChecklistItem {
  key: string;
  label: string;
  /** Which driver state must be reached to consider the item ticked */
  ticked: boolean;
  /** Whether this item is the one being filled in right now */
  active: boolean;
}

export const additionalResponse = {
  prompt: "Do you transfer money abroad?",
  answer: "Yes",
  detail: "Transfer money abroad 20,000 USD to my aunt in Spain.",
};

export function onboardingChecklist(state: FlowState): ChecklistItem[] {
  const ns = state.nodeStates;
  const onboardingDone = ns.onboarding === "complete";
  const onboardingActive = ns.onboarding === "active" || ns.onboarding === "processing";
  const kycDone = ns.kyc === "complete";
  const kycActive = ns.kyc === "active" || ns.kyc === "processing";
  const crrTouched = ns.crr !== "idle";

  // Items 1–5 belong to the basic intake (onboarding). They tick when onboarding completes.
  // PEP + Sanctions belong to KYC/CRR — they tick once those nodes have run.
  const base: Array<{ key: string; label: string; phase: "intake" | "kyc" | "crr" }> = [
    { key: "personal", label: "Personal Information", phase: "intake" },
    { key: "address", label: "Address", phase: "intake" },
    { key: "employment", label: "Employment Details", phase: "intake" },
    { key: "funds", label: "Source of Funds", phase: "intake" },
    { key: "purpose", label: "Purpose of Account", phase: "intake" },
    { key: "pep", label: "PEP Status", phase: "kyc" },
    { key: "sanctions", label: "Sanctions Screening", phase: "crr" },
  ];

  return base.map((b) => {
    let ticked = false;
    let active = false;
    if (b.phase === "intake") {
      ticked = onboardingDone || kycDone || crrTouched;
      active = !ticked && onboardingActive;
    } else if (b.phase === "kyc") {
      ticked = kycDone || crrTouched;
      active = !ticked && (kycActive || onboardingDone);
    } else {
      ticked = crrTouched && ns.crr !== "active" && ns.crr !== "processing";
      active = !ticked && (ns.crr === "active" || ns.crr === "processing" || kycDone);
    }
    return { key: b.key, label: b.label, ticked, active };
  });
}

export type RiskTone = "pending" | "low" | "medium" | "review";

export interface RiskBadgeData {
  score: number | null;
  label: string;
  tone: RiskTone;
}

/**
 * Derive the risk-score badge from CRR + the kyc/aml case state.
 * Numbers are illustrative ("18 LOW", "62 MEDIUM-HIGH") — they exist to make
 * the storytelling concrete, not to drive any real logic.
 */
export function riskBadge(state: FlowState): RiskBadgeData {
  const ns = state.nodeStates;
  if (ns.amlCase === "alert" || ns.kycCase === "alert") {
    return { score: 72, label: "Needs review", tone: "review" };
  }
  if (ns.crr === "complete") {
    // PEP scenario bumps CRR via a second pass — detect via kyc completing twice (proxy: kycCase touched but not alert)
    // Simpler proxy: if the activeScenario is "pep" or "edd", show medium.
    const sc = state.activeScenario;
    if (sc === "pep") {
      return { score: 62, label: "Medium-high", tone: "medium" };
    }
    return { score: 18, label: "Low risk", tone: "low" };
  }
  if (ns.crr === "active" || ns.crr === "processing") {
    return { score: null, label: "Calculating…", tone: "pending" };
  }
  return { score: null, label: "Pending", tone: "pending" };
}

/** Last N rewritten log lines, oldest → newest. */
export function recentDiary(state: FlowState, n = 2): string[] {
  const tail = state.log.slice(-n);
  return tail.map((l) => rewriteLog(l).text);
}

/* ------------------------------------------------------------------
 * Log rewriting
 * ------------------------------------------------------------------ */

const rewrites: Array<[RegExp, string]> = [
  [/^Onboarding event received.*$/i, "Angela starts her application"],
  [/^KYC QA triggered.*$/i, "We ask Angela a few questions to get to know her"],
  [/^CRR calculating.*$/i, "Working out how risky Angela's profile looks"],
  [/^CRR complete.*LOW.*$/i, "Angela looks low-risk — welcome aboard"],
  [/^CRR recalculating.*$/i, "Taking another look at Angela's risk"],
  [/^CRR updated.*PEP.*$/i, "Angela is a politically exposed person — extra checks kick in"],
  [/^TM rules refreshed.*$/i, "Tightening how closely we watch Angela's activity"],
  [/^EDD case opened.*$/i, "A reviewer is taking a closer look at Angela"],
  [/^AI Layer activated.*$/i, "AI is helping the team focus on what matters"],
  [/^AI Layer scoring anomaly.*$/i, "AI is double-checking what it just saw"],
  [/^AI recommendation: Enhanced review.*$/i, "AI suggests a human do an extra review"],
  [/^AI recommendation: prioritise.*$/i, "AI flags this for a human to review first"],
  [/^Live transaction ingest started.*$/i, "Angela's account is now active — we're watching her transactions"],
  [/^TM evaluating.*$/i, "Checking Angela's recent activity against our rules"],
  [/^TM ALERT.*structuring.*$/i, "Angela's recent activity looks unusual"],
  [/^TM clear.*$/i, "Everything looks normal on Angela's account"],
  [/^AML case .* opened.*$/i, "We open a case on Angela's account — investigators take over"],
  [/^SAR flag raised.*$/i, "We're preparing to notify the regulator"],
  [/^Customer onboarded.*account created.*$/i, "Angela is fully onboarded — her account is ready 🎉"],
  [/^Transaction monitoring activated.*$/i, "Angela's account is live — we start watching for any activity"],
  [/^TM running.*$/i, "Monitoring is active — nothing to flag yet"],
  [/^Customer onboarded.*$/i, "Angela is fully onboarded 🎉"],
  [/^Name screening started.*$/i, "We check Angela's name against global sanctions and PEP lists"],
  [/^Name screening re-run.*$/i, "We re-check Angela's name against the latest sanctions lists"],
  [/^Screening clear.*$/i, "No flags found — Angela isn't on any watchlist"],
  [/^Name screening HIT.*PEP.*$/i, "Angela's name matches a politically exposed person list"],
  [/^AML client rule triggered.*Fornyelse.*$/i, "Our compliance engine flags Angela — annual renewal required"],
  [/^Customer notified.*Fornyelse.*$/i, "Angela sees a renewal prompt in her mobile bank"],
  [/^KYC Case opened.*initiating.*$/i, "A renewal case opens and kicks off checks automatically"],
  [/^KYC periodic questionnaire.*$/i, "We send Angela a short set of renewal questions"],
  [/^Customer answers received.*$/i, "Angela's answers are in — an adviser checks the updated details"],
  [/^CRR recalculating.*transaction.*$/i, "We re-check Angela's risk score using her latest activity"],
  [/^AI Layer activated.*drift.*$/i, "AI checks whether Angela's risk profile has changed"],
  [/^CRR confirmed.*LOW.*$/i, "Angela's risk score is still low — no changes needed"],
  [/^Periodic review complete.*Godkjent.*$/i, "Annual review done — AML status confirmed: Godkjent ✓"],
  [/^Periodic review complete.*$/i, "Angela's annual review is done — all clear"],
];

export function rewriteLog(entry: LogEntry): LogEntry {
  for (const [pattern, replacement] of rewrites) {
    if (pattern.test(entry.text)) {
      return { ...entry, text: replacement };
    }
  }
  return entry;
}
