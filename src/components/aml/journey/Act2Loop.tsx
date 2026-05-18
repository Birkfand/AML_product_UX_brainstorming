import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ScanLine, Gauge, Eye, Siren, ShieldQuestion, Sparkles } from "lucide-react";
import AngelaFigure from "../persona/AngelaFigure";
import DiaryStrip from "./DiaryStrip";
import { aiActive, currentAct, personaPose, recentDiary } from "@/lib/aml/productCopy";
import type { FlowState } from "@/lib/aml/reducer";
import type { NodeId, NodeStatus } from "@/lib/aml/types";
import { cn } from "@/lib/utils";

// ─── Internal coordinate space: 900 × 480 ────────────────────────────────────
const W = 900, H = 480;
const OX = 450, OY = 240;   // oval center
const RX = 160, RY = 118;   // oval radii

function pct(x: number, y: number) {
  return { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` } as React.CSSProperties;
}

function ovalPt(deg: number) {
  const r = (deg * Math.PI) / 180;
  return { x: OX + RX * Math.cos(r), y: OY + RY * Math.sin(r) };
}

const STATUS_COLOR: Record<NodeStatus, string> = {
  idle:       "var(--state-idle)",
  active:     "var(--state-active)",
  processing: "var(--state-active)",
  complete:   "var(--state-complete)",
  alert:      "var(--state-alert)",
};

function nc(state: FlowState, id: NodeId) { return STATUS_COLOR[state.nodeStates[id]]; }
function pulse(state: FlowState, id: NodeId) {
  const s = state.nodeStates[id];
  return s === "active" || s === "processing" || s === "alert";
}

function angelaPos(state: FlowState): { x: number; y: number } {
  const act = currentAct(state);
  const ns = state.nodeStates;
  if (act === "exit" && ns.amlCase !== "alert" && ns.kycCase !== "alert") return { x: 800, y: OY - 30 };
  if (act === "establish") {
    if (ns.crr !== "idle")          return { x: 260, y: OY - 28 };
    if (ns.nameScreening !== "idle") return { x: 178, y: OY - 28 };
    if (ns.kyc !== "idle")          return { x: 100, y: OY - 28 };
    return { x: 28, y: OY - 28 };
  }
  return { x: OX, y: OY - 28 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NodeDotProps {
  x: number; y: number;
  icon: React.ElementType;
  label: string;
  color: string;
  pulsing: boolean;
  size?: "sm" | "md";
}

function NodeDot({ x, y, icon: Icon, label, color, pulsing, size = "md" }: NodeDotProps) {
  const dim = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const fontSize = size === "sm" ? "text-[9px]" : "text-[10px]";
  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{ ...pct(x, y), transform: "translate(-50%, -50%)" }}
    >
      <div
        className={cn("relative flex items-center justify-center rounded-full border-2 bg-[oklch(0.2_0.02_265/0.95)] backdrop-blur transition-all duration-300", dim)}
        style={{ borderColor: color, boxShadow: pulsing ? `0 0 20px -4px ${color}` : undefined }}
      >
        <Icon className={iconDim} style={{ color }} />
        {pulsing && (
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-40"
            style={{ background: color }}
          />
        )}
      </div>
      <div
        className={cn("max-w-[80px] text-center font-medium leading-tight text-white/75", fontSize)}
        style={{ whiteSpace: "pre-line" }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

import type React from "react";

interface Props { state: FlowState }

export default function Act2Loop({ state }: Props) {
  const act = currentAct(state);
  const ai = aiActive(state);
  const diary = recentDiary(state, 2);
  const loopAlive = state.nodeStates.tm !== "idle" || state.nodeStates.amlCase !== "idle" || state.nodeStates.kycCase !== "idle";
  const orbitSpeed = (state.nodeStates.tm === "alert" || state.nodeStates.amlCase === "alert" || state.nodeStates.kycCase === "alert") ? 5 : 9;
  const ns = state.nodeStates;

  // oval key points
  const ovalLeft  = ovalPt(180); // entry from left lane
  const ovalRight = ovalPt(0);   // exit to right lane
  const ovalBot   = ovalPt(90);  // TM station
  const ovalTop   = ovalPt(270); // EDD station
  const ovalLB    = ovalPt(140); // investigation station (lower-left)

  // Angela
  const ap = angelaPos(state);
  const basePose = personaPose(state);
  const pose = act === "exit" && ns.amlCase !== "alert" && ns.kycCase !== "alert" ? "leaving"
    : act === "establish" ? "walking"
    : "standing";

  // right-side renewal stack x anchor
  const renewX = ovalRight.x + 85;
  const renewYs = [OY - 105, OY - 52, OY, OY + 52];

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="relative min-h-0 flex-1">
        {/* ── SVG structural layer ───────────────────────────────── */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          className="absolute inset-0"
          overflow="visible"
        >
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="oklch(1 0 0 / 0.28)" />
            </marker>
            <marker id="arr-blue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="var(--state-active)" />
            </marker>
          </defs>

          {/* Entry lane */}
          <line x1={30} y1={OY} x2={ovalLeft.x - 4} y2={OY}
            stroke="oklch(1 0 0 / 0.2)" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Exit lane */}
          <line x1={ovalRight.x + 4} y1={OY} x2={W - 30} y2={OY}
            stroke="oklch(1 0 0 / 0.2)" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Oval */}
          <ellipse cx={OX} cy={OY} rx={RX} ry={RY}
            fill="none"
            stroke={loopAlive ? "oklch(0.65 0.18 255 / 0.35)" : "oklch(1 0 0 / 0.12)"}
            strokeWidth={loopAlive ? 2.5 : 1.5}
            strokeDasharray={loopAlive ? "none" : "5 7"}
            className="transition-all duration-700"
          />

          {/* AI aura */}
          {ai && (
            <ellipse cx={OX} cy={OY} rx={RX + 14} ry={RY + 14}
              fill="none" stroke="var(--state-ai)" strokeWidth="1" opacity="0.3"
              strokeDasharray="3 8"
            />
          )}

          {/* Connector ticks from oval right arc to renewal stack */}
          {renewYs.map((ry2, i) => {
            const angle = Math.asin((ry2 - OY) / RY);
            const edgeX = OX + RX * Math.cos(angle);
            return (
              <line key={i}
                x1={edgeX + 2} y1={ry2} x2={renewX - 42} y2={ry2}
                stroke="oklch(1 0 0 / 0.15)" strokeWidth="1" strokeDasharray="3 4"
              />
            );
          })}

          {/* Renewal stack vertical connector */}
          <line x1={renewX} y1={renewYs[0] + 18} x2={renewX} y2={renewYs[3] - 18}
            stroke="oklch(1 0 0 / 0.12)" strokeWidth="1" strokeDasharray="3 5" />

          {/* Travelling dot — path inlined on animateMotion to avoid mpath id lookup issues */}
          {loopAlive && (
            <circle r="5" fill="var(--state-active)" opacity="0.85">
              <animateMotion
                dur={`${orbitSpeed}s`}
                repeatCount="indefinite"
                path={`M ${OX + RX} ${OY} A ${RX} ${RY} 0 1 1 ${OX + RX - 0.01} ${OY}`}
              />
            </circle>
          )}

          {/* Entry step connectors */}
          {([72, 162, 248] as const).map((x, i, arr) =>
            i < arr.length - 1 ? (
              <line key={i} x1={x + 22} y1={OY} x2={arr[i + 1] - 22} y2={OY}
                stroke="oklch(1 0 0 / 0.18)" strokeWidth="1.2" markerEnd="url(#arr)" />
            ) : null
          )}
          {/* Last connector to oval */}
          <line x1={248 + 22} y1={OY} x2={ovalLeft.x - 5} y2={OY}
            stroke="oklch(1 0 0 / 0.18)" strokeWidth="1.2" markerEnd="url(#arr)" />
        </svg>

        {/* ── Center label ───────────────────────────────────────── */}
        <div
          className="absolute pointer-events-none flex flex-col items-center"
          style={{ ...pct(OX, OY + 28), transform: "translate(-50%, 0)" }}
        >
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">Løpende oppfølging</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">av kundeforholdet</div>
        </div>

        {/* ── Section labels ─────────────────────────────────────── */}
        <div className="absolute pointer-events-none"
          style={{ ...pct(130, 38), transform: "translateX(-50%)" }}>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">Kundeetablering</div>
        </div>
        <div className="absolute pointer-events-none"
          style={{ ...pct(790, 38), transform: "translateX(-50%)" }}>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">Kundeforhold avsluttes</div>
        </div>

        {/* ── Entry lane nodes ───────────────────────────────────── */}
        <NodeDot x={72}  y={OY} icon={ClipboardList} label={"Innsamling av\nkundeopplysninger"}
          color={nc(state, "kyc")}           pulsing={pulse(state, "kyc")}           size="sm" />
        <NodeDot x={162} y={OY} icon={ScanLine}      label={"Navne-\nscreening"}
          color={nc(state, "nameScreening")} pulsing={pulse(state, "nameScreening")} size="sm" />
        <NodeDot x={248} y={OY} icon={Gauge}          label={"Risiko-\nscoring"}
          color={nc(state, "crr")}           pulsing={pulse(state, "crr")}           size="sm" />

        {/* ── Orbital stations ───────────────────────────────────── */}
        {/* Bottom — Transaction Monitoring */}
        <NodeDot x={ovalBot.x} y={ovalBot.y + 24} icon={Eye}
          label={"Overvåkning av\nkundeadferd"}
          color={nc(state, "tm")} pulsing={pulse(state, "tm")} />

        {/* Lower-left — Investigation */}
        <NodeDot x={ovalLB.x - 28} y={ovalLB.y} icon={Siren}
          label={"Undersøkelse og\nrapportering"}
          color={ns.amlCase === "alert" ? STATUS_COLOR.alert : STATUS_COLOR.idle}
          pulsing={ns.amlCase === "alert"} />

        {/* Top — Enhanced measures / EDD */}
        <NodeDot x={ovalTop.x} y={ovalTop.y - 24} icon={ShieldQuestion}
          label={"Forsterkede\nkundetiltak"}
          color={ns.kycCase === "alert" || ns.kycCase === "active" ? nc(state, "kycCase") : STATUS_COLOR.idle}
          pulsing={ns.kycCase === "alert" || ns.kycCase === "active"} />

        {/* ── Periodic renewal stack (right side of oval) ────────── */}
        {[
          { icon: ClipboardList, label: "Innsamling av\nkundeopplysninger", id: "kyc" as NodeId },
          { icon: ScanLine,      label: "Navne-\nscreening",               id: "nameScreening" as NodeId },
          { icon: Gauge,         label: "Risiko-\nscoring",                id: "crr" as NodeId },
          { icon: ShieldQuestion,label: "Forsterkede\nkundetiltak",         id: "kycCase" as NodeId },
        ].map((item, i) => (
          <NodeDot key={item.id + i}
            x={renewX} y={renewYs[i]}
            icon={item.icon} label={item.label}
            color={nc(state, item.id)} pulsing={pulse(state, item.id)}
            size="sm" />
        ))}

        {/* ── Angela ─────────────────────────────────────────────── */}
        <motion.div
          className="absolute pointer-events-none"
          animate={{ left: `${(ap.x / W) * 100}%`, top: `${(ap.y / H) * 100}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ transform: "translate(-50%, -100%)" }}
        >
          <AngelaFigure pose={pose} size={72} label="" />
        </motion.div>

        {/* ── Alert bubble ───────────────────────────────────────── */}
        <AnimatePresence>
          {ns.tm === "alert" && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute left-1/2 top-[62%] -translate-x-1/2 whitespace-nowrap rounded-lg border border-state-alert/50 bg-state-alert/10 px-2.5 py-1 text-[10px] font-medium text-state-alert shadow-lg backdrop-blur"
            >
              Wait — something doesn't look right.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI badge ───────────────────────────────────────────── */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px]">
          <Sparkles className={cn("h-3 w-3 transition-colors", ai ? "text-state-ai" : "text-white/25")} />
          <span className={cn("transition-colors", ai ? "text-state-ai/90" : "text-white/35")}>
            {ai ? "AI is helping the team focus" : "AI quietly watches in the background"}
          </span>
        </div>
      </div>

      <DiaryStrip lines={diary} />
    </div>
  );
}
