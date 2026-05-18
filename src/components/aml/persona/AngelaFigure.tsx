import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AngelaPose = "walking" | "standing" | "leaving";

interface Props {
  pose: AngelaPose;
  size?: number;
  className?: string;
  /** Label shown beneath the figure, e.g. "Angela" */
  label?: string;
}

/**
 * Minimal flat SVG figure of Angela in three poses.
 * Two colour tokens only: hair/skin neutral + jacket using state-active.
 * Drawn on a 60×90 viewbox.
 */
export default function AngelaFigure({ pose, size = 80, className, label = "Angela" }: Props) {
  return (
    <motion.div
      className={cn("relative flex flex-col items-center", className)}
      animate={pose === "standing" ? { y: [0, -2, 0] } : { y: 0 }}
      transition={
        pose === "standing"
          ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 }
      }
    >
      <svg
        width={size}
        height={(size * 90) / 60}
        viewBox="0 0 60 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Hair */}
        <path
          d="M22 14 Q22 6 30 6 Q38 6 38 14 L38 19 Q38 22 35 22 L25 22 Q22 22 22 19 Z"
          fill="oklch(0.32 0.04 30)"
        />
        {/* Face */}
        <circle cx="30" cy="18" r="6" fill="oklch(0.78 0.06 55)" />
        {/* Ponytail */}
        <path d="M22 15 Q16 18 17 26" stroke="oklch(0.32 0.04 30)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body / jacket */}
        <Body pose={pose} />
        {/* Legs */}
        <Legs pose={pose} />
        {/* Arms + suitcase */}
        <Arms pose={pose} />
      </svg>
      {label && (
        <span className="mt-1 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-white/60">
          {label}
        </span>
      )}
    </motion.div>
  );
}

function Body({ pose }: { pose: AngelaPose }) {
  // Slight lean forward when walking/leaving
  const lean = pose === "standing" ? 0 : 1.5;
  return (
    <path
      d={`M${24 - lean} 25 L${36 + lean} 25 L${37 + lean} 50 L${23 - lean} 50 Z`}
      fill="var(--state-active)"
      opacity="0.95"
    />
  );
}

function Legs({ pose }: { pose: AngelaPose }) {
  if (pose === "standing") {
    return (
      <g stroke="oklch(0.22 0.02 265)" strokeWidth="4" strokeLinecap="round">
        <line x1="27" y1="50" x2="27" y2="78" />
        <line x1="33" y1="50" x2="33" y2="78" />
      </g>
    );
  }
  // walking / leaving — one leg forward
  return (
    <g stroke="oklch(0.22 0.02 265)" strokeWidth="4" strokeLinecap="round">
      <line x1="27" y1="50" x2="22" y2="78" />
      <line x1="33" y1="50" x2="38" y2="78" />
    </g>
  );
}

function Arms({ pose }: { pose: AngelaPose }) {
  if (pose === "standing") {
    return (
      <g stroke="var(--state-active)" strokeWidth="3.5" strokeLinecap="round">
        <line x1="24" y1="30" x2="22" y2="48" />
        <line x1="36" y1="30" x2="38" y2="48" />
      </g>
    );
  }
  if (pose === "leaving") {
    return (
      <>
        {/* Back arm swung */}
        <line
          x1="24"
          y1="30"
          x2="18"
          y2="44"
          stroke="var(--state-active)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Front arm holding suitcase */}
        <line
          x1="36"
          y1="30"
          x2="42"
          y2="48"
          stroke="var(--state-active)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Suitcase */}
        <rect x="38" y="48" width="12" height="9" rx="1.5" fill="oklch(0.45 0.03 260)" stroke="oklch(0.18 0.02 265)" strokeWidth="1" />
        <rect x="42" y="45" width="4" height="3" rx="0.8" fill="oklch(0.45 0.03 260)" stroke="oklch(0.18 0.02 265)" strokeWidth="1" />
      </>
    );
  }
  // walking — opposite arm swing to legs
  return (
    <g stroke="var(--state-active)" strokeWidth="3.5" strokeLinecap="round">
      <line x1="24" y1="30" x2="30" y2="46" />
      <line x1="36" y1="30" x2="30" y2="46" />
    </g>
  );
}
