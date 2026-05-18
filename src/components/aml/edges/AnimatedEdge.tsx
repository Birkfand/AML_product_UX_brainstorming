import { useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { EdgeMeta } from "@/lib/aml/graph";

interface AnimatedEdgeProps extends EdgeProps {
  data?: EdgeMeta & { active?: boolean };
}

const variantColors = {
  default: "var(--state-active)",
  context: "var(--state-active)",
  ai: "var(--state-ai)",
};

export default function AnimatedEdge(props: AnimatedEdgeProps) {
  const {
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    data, id,
  } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  const [hover, setHover] = useState(false);
  const variant = data?.variant ?? "default";
  const color = variantColors[variant];
  const active = data?.active ?? false;
  const dashed = variant !== "default";

  return (
    <>
      {/* invisible hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ cursor: "pointer" }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: hover ? 2.5 : 1.5,
          strokeOpacity: active ? 0.95 : hover ? 0.7 : 0.35,
          strokeDasharray: dashed ? "4 4" : active ? "6 6" : undefined,
          transition: "stroke-opacity 200ms, stroke-width 200ms",
        }}
        className={active ? "edge-animated" : undefined}
      />
      {active && (
        <circle r={3.2} fill={color} opacity={0.95}>
          <animateMotion dur="1.6s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {(hover || active) && data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
            }}
            className="rounded-md border border-white/10 bg-popover/95 px-2 py-1 text-[10px] font-medium text-white/85 shadow-lg backdrop-blur"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
