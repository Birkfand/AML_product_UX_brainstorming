export type NodeId =
  | "onboarding"
  | "kyc"
  | "nameScreening"
  | "crr"
  | "tm"
  | "amlCase"
  | "kycCase"
  | "ai";

export type NodeStatus =
  | "idle"
  | "active"
  | "processing"
  | "complete"
  | "alert";

export type EdgeId =
  | "onboarding-kyc"
  | "kyc-nameScreening"
  | "nameScreening-crr"
  | "kyc-tm"
  | "crr-tm"
  | "tm-amlCase"
  | "tm-kycCase"
  | "ai-tm"
  | "ai-amlCase"
  | "ai-kycCase";

export type LogLevel = "trigger" | "success" | "processing" | "warn" | "alert";

export interface LogEntry {
  id: string;
  time: string;
  level: LogLevel;
  text: string;
}

export type ScenarioId = "standard" | "pep" | "suspicious" | "periodic";

export interface ScenarioStep {
  delayMs: number;
  nodeUpdates?: Partial<Record<NodeId, NodeStatus>>;
  edgeUpdates?: Partial<Record<EdgeId, boolean>>;
  log?: { level: LogLevel; text: string };
  statusText?: Partial<Record<NodeId, string>>;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  tone: "ok" | "warn" | "alert";
  steps: ScenarioStep[];
}
