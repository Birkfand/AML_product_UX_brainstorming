import { useCallback, useEffect, useReducer, useState } from "react";
import {
  Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider,
  useEdgesState, useNodesState, type Edge, type Node, type NodeTypes, type EdgeTypes,
} from "@xyflow/react";
import { ShieldCheck } from "lucide-react";
import ProductNode from "./nodes/ProductNode";
import AnimatedEdge from "./edges/AnimatedEdge";
import ScenarioBar from "./ScenarioBar";
import EventLogPanel from "./EventLogPanel";
import ViewToggle, { type ViewMode } from "./ViewToggle";
import ProductJourney from "./ProductJourney";
import { initialEdges, initialNodes, type EdgeMeta, type ProductNodeData } from "@/lib/aml/graph";
import { initialState, reducer } from "@/lib/aml/reducer";
import { scenarios } from "@/lib/aml/scenarios";
import { rewriteLog } from "@/lib/aml/productCopy";
import type { ScenarioId } from "@/lib/aml/types";

const nodeTypes: NodeTypes = { product: ProductNode as never };
const edgeTypes: EdgeTypes = { animated: AnimatedEdge as never };

function FlowInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [logOpen, setLogOpen] = useState(true);
  const [view, setView] = useState<ViewMode>("architecture");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ProductNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeMeta>>(initialEdges);

  // Sync derived state (status/statusText/edge active) into RF nodes/edges
  useEffect(() => {
    setNodes((curr) =>
      curr.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: state.nodeStates[n.data.id],
          statusText: state.nodeStatusText[n.data.id],
        } as ProductNodeData & { status: unknown; statusText: string },
      })),
    );
  }, [state.nodeStates, state.nodeStatusText, setNodes]);

  useEffect(() => {
    setEdges((curr) =>
      curr.map((e) => ({
        ...e,
        data: { ...(e.data as EdgeMeta), active: !!state.edgeActive[e.id as keyof typeof state.edgeActive] },
      })),
    );
  }, [state.edgeActive, setEdges]);

  const handleStart = useCallback((id: ScenarioId) => dispatch({ type: "START", scenarioId: id }), []);
  const handleNext = useCallback(() => dispatch({ type: "APPLY_STEP" }), []);
  const handleReset = useCallback(() => dispatch({ type: "RESET" }), []);

  const totalSteps = state.activeScenario ? scenarios[state.activeScenario].steps.length : 0;
  const canStep = !!state.activeScenario && state.stepIndex < totalSteps;

  // Keyboard shortcuts: → / Space = Next, R = Reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.code === "Space") {
        if (canStep) { e.preventDefault(); handleNext(); }
      } else if (e.key === "r" || e.key === "R") {
        handleReset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canStep, handleNext, handleReset]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--canvas)] text-white aml-grid-bg">
      {/* Top chrome */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 bg-popover/70 px-4 py-2.5 backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-state-active/15 text-state-active">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mr-1">
            <h1 className="text-sm font-semibold tracking-tight text-white">AML Compliance Flow</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              {view === "architecture" ? "Live operations dashboard" : "Following Angela's journey"}
            </p>
          </div>
          <div className="ml-1 border-l border-white/10 pl-3">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        <div className="pointer-events-auto rounded-xl border border-white/10 bg-popover/70 px-3 py-2 backdrop-blur">
          <ScenarioBar
            activeScenario={state.activeScenario}
            isPlaying={state.isPlaying}
            canStep={canStep}
            stepIndex={state.stepIndex}
            totalSteps={totalSteps}
            onStart={handleStart}
            onNextStep={handleNext}
            onReset={handleReset}
          />
        </div>

        <div className="pointer-events-auto hidden rounded-xl border border-white/10 bg-popover/70 px-3 py-2 text-[11px] text-white/60 backdrop-blur xl:flex xl:flex-col xl:gap-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Legend</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Legend dot="bg-state-idle" label="idle" />
            <Legend dot="bg-state-active" label="active" />
            <Legend dot="bg-state-complete" label="complete" />
            <Legend dot="bg-state-alert" label="alert" />
            <Legend dot="bg-state-ai" label="AI" />
          </div>
        </div>
      </header>

      {view === "architecture" ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "animated" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="oklch(1 0 0 / 0.06)" />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            pannable zoomable
            maskColor="oklch(0.16 0.02 265 / 0.7)"
            nodeColor={() => "oklch(0.4 0.05 265)"}
            style={{ marginLeft: 56 }}
          />
        </ReactFlow>
      ) : (
        <ProductJourney state={state} />
      )}

      <EventLogPanel
        log={state.log}
        open={logOpen}
        onToggle={() => setLogOpen((o) => !o)}
        rewrite={view === "product" ? rewriteLog : undefined}
        title={view === "product" ? "Angela's story" : "Event Log"}
      />
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">{label}</span>
    </span>
  );
}

export default function AmlFlow() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
