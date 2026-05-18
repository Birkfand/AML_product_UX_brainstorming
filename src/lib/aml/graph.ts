import type { Edge, Node } from "@xyflow/react";
import {
  UserPlus,
  ClipboardList,
  ScanLine,
  Gauge,
  Activity,
  FolderSearch,
  FileWarning,
  Sparkles,
} from "lucide-react";
import type { NodeId } from "./types";

export interface ProductNodeData extends Record<string, unknown> {
  id: NodeId;
  title: string;
  icon: typeof UserPlus;
  consumes: string[];
  outputs: string[];
  variant?: "default" | "ai";
}

export const initialNodes: Node<ProductNodeData>[] = [
  {
    id: "onboarding",
    type: "product",
    position: { x: 0, y: 200 },
    data: {
      id: "onboarding",
      title: "Customer Onboarding",
      icon: UserPlus,
      consumes: ["New customer application", "ID document scans"],
      outputs: ["Customer ID", "Onboarding event"],
    },
  },
  {
    id: "kyc",
    type: "product",
    position: { x: 260, y: 200 },
    data: {
      id: "kyc",
      title: "KYC QA",
      icon: ClipboardList,
      consumes: ["Onboarding event", "Customer profile"],
      outputs: ["Structured KYC answers", "PEP / sanctions flags"],
    },
  },
  {
    id: "nameScreening",
    type: "product",
    position: { x: 520, y: 200 },
    data: {
      id: "nameScreening",
      title: "Name Screening",
      icon: ScanLine,
      consumes: ["KYC answers", "Identity data", "Sanctions list updates"],
      outputs: ["PEP flags", "Sanctions hits", "Adverse media alerts"],
    },
  },
  {
    id: "crr",
    type: "product",
    position: { x: 780, y: 60 },
    data: {
      id: "crr",
      title: "CRR",
      icon: Gauge,
      consumes: ["Screening results", "PEP / sanctions flags", "Geography"],
      outputs: ["Dynamic risk score (LOW / MED / HIGH)"],
    },
  },
  {
    id: "tm",
    type: "product",
    position: { x: 1060, y: 200 },
    data: {
      id: "tm",
      title: "Transaction Monitoring",
      icon: Activity,
      consumes: ["CRR score", "KYC context", "Live transactions"],
      outputs: ["Rule alerts", "Behavioural anomalies"],
    },
  },
  {
    id: "amlCase",
    type: "product",
    position: { x: 1340, y: 60 },
    data: {
      id: "amlCase",
      title: "AML Case Management",
      icon: FolderSearch,
      consumes: ["TM rule alerts", "AI anomaly score"],
      outputs: ["SAR filings", "Investigation outcomes"],
    },
  },
  {
    id: "kycCase",
    type: "product",
    position: { x: 1340, y: 330 },
    data: {
      id: "kycCase",
      title: "KYC Case Management",
      icon: FileWarning,
      consumes: ["EDD triggers", "Periodic review schedule", "AI risk insights"],
      outputs: ["Refreshed KYC profile", "EDD outcome"],
    },
  },
  {
    id: "ai",
    type: "product",
    position: { x: 800, y: 460 },
    data: {
      id: "ai",
      title: "AI Layer",
      icon: Sparkles,
      variant: "ai",
      consumes: ["TM signals", "Case context", "Historical patterns"],
      outputs: ["Anomaly score", "Investigator recommendations"],
    },
  },
];

export interface EdgeMeta extends Record<string, unknown> {
  label: string;
  variant: "default" | "context" | "ai";
}

export const initialEdges: Edge<EdgeMeta>[] = [
  edge("onboarding-kyc",      "onboarding",    "kyc",           "Customer ID + profile",        "default"),
  edge("kyc-nameScreening",   "kyc",           "nameScreening", "KYC answers + identity data",  "default"),
  edge("nameScreening-crr",   "nameScreening", "crr",           "Screening results + flags",    "default"),
  edge("kyc-tm",              "kyc",           "tm",            "KYC context feed",             "context"),
  edge("crr-tm",              "crr",           "tm",            "Risk score",                   "default"),
  edge("tm-amlCase",          "tm",            "amlCase",       "Rule alerts",                  "default"),
  edge("tm-kycCase",          "tm",            "kycCase",       "EDD trigger",                  "default"),
  edge("ai-tm",               "ai",            "tm",            "Anomaly signals",              "ai"),
  edge("ai-amlCase",          "ai",            "amlCase",       "Investigator recommendations",  "ai"),
  edge("ai-kycCase",          "ai",            "kycCase",       "Risk profile insight",         "ai"),
];

function edge(
  id: string,
  source: string,
  target: string,
  label: string,
  variant: EdgeMeta["variant"],
): Edge<EdgeMeta> {
  return {
    id,
    source,
    target,
    type: "animated",
    data: { label, variant },
  };
}
