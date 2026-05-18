import type { EdgeId, LogEntry, NodeId, NodeStatus, Scenario, ScenarioId, ScenarioStep } from "./types";
import { scenarios } from "./scenarios";
import { initialNodes } from "./graph";

export interface FlowState {
  nodeStates: Record<NodeId, NodeStatus>;
  nodeStatusText: Record<NodeId, string>;
  edgeActive: Record<EdgeId, boolean>;
  activeScenario: ScenarioId | null;
  stepIndex: number; // next step to apply
  isPlaying: boolean;
  log: LogEntry[];
}

const allNodeIds = initialNodes.map((n) => n.data.id);

function idleNodeStates(): Record<NodeId, NodeStatus> {
  return Object.fromEntries(allNodeIds.map((id) => [id, "idle"])) as Record<NodeId, NodeStatus>;
}
function idleStatusText(): Record<NodeId, string> {
  return Object.fromEntries(allNodeIds.map((id) => [id, "idle"])) as Record<NodeId, string>;
}

export const initialState: FlowState = {
  nodeStates: idleNodeStates(),
  nodeStatusText: idleStatusText(),
  edgeActive: {} as Record<EdgeId, boolean>,
  activeScenario: null,
  stepIndex: 0,
  isPlaying: false,
  log: [],
};

export type Action =
  | { type: "START"; scenarioId: ScenarioId }
  | { type: "APPLY_STEP" }
  | { type: "PAUSE" }
  | { type: "RESET" };

function now(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function applyStep(state: FlowState, step: ScenarioStep): FlowState {
  const nodeStates = { ...state.nodeStates };
  const nodeStatusText = { ...state.nodeStatusText };
  const edgeActive = { ...state.edgeActive };
  if (step.nodeUpdates) {
    for (const [k, v] of Object.entries(step.nodeUpdates)) {
      nodeStates[k as NodeId] = v as NodeStatus;
      // default status text from state if not overridden later
      if (!step.statusText || !(k in step.statusText)) {
        nodeStatusText[k as NodeId] = defaultText(v as NodeStatus);
      }
    }
  }
  if (step.statusText) {
    for (const [k, v] of Object.entries(step.statusText)) {
      nodeStatusText[k as NodeId] = v as string;
    }
  }
  if (step.edgeUpdates) {
    for (const [k, v] of Object.entries(step.edgeUpdates)) {
      edgeActive[k as EdgeId] = v as boolean;
    }
  }
  const log = step.log
    ? [
        ...state.log,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: now(),
          level: step.log.level,
          text: step.log.text,
        } satisfies LogEntry,
      ]
    : state.log;
  return { ...state, nodeStates, nodeStatusText, edgeActive, log };
}

function defaultText(status: NodeStatus): string {
  switch (status) {
    case "active": return "active";
    case "processing": return "processing";
    case "complete": return "complete";
    case "alert": return "alert";
    default: return "idle";
  }
}

export function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "START": {
      const fresh: FlowState = {
        ...initialState,
        nodeStates: idleNodeStates(),
        nodeStatusText: idleStatusText(),
        edgeActive: {} as Record<EdgeId, boolean>,
        log: [],
        activeScenario: action.scenarioId,
        stepIndex: 0,
        isPlaying: false,
      };
      return fresh;
    }
    case "APPLY_STEP": {
      if (!state.activeScenario) return state;
      const sc: Scenario = scenarios[state.activeScenario];
      if (state.stepIndex >= sc.steps.length) return state;
      const step = sc.steps[state.stepIndex];
      const next = applyStep(state, step);
      return { ...next, stepIndex: state.stepIndex + 1, isPlaying: false };
    }
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "RESET":
      return {
        ...initialState,
        nodeStates: idleNodeStates(),
        nodeStatusText: idleStatusText(),
        edgeActive: {} as Record<EdgeId, boolean>,
      };
  }
}
