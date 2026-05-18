import type { Scenario } from "./types";

export const scenarios: Record<Scenario["id"], Scenario> = {
  standard: {
    id: "standard",
    label: "Standard Onboarding",
    tone: "ok",
    steps: [
      {
        delayMs: 0,
        nodeUpdates: { onboarding: "active" },
        edgeUpdates: { "onboarding-kyc": true },
        statusText: { onboarding: "receiving application" },
        log: { level: "trigger", text: "Onboarding event received — Customer ID #2210" },
      },
      {
        delayMs: 900,
        nodeUpdates: { onboarding: "complete", kyc: "processing" },
        edgeUpdates: { "kyc-nameScreening": true, "kyc-tm": true },
        statusText: { kyc: "dispatching 12 questions" },
        log: { level: "success", text: "KYC QA triggered — 12 questions dispatched" },
      },
      {
        delayMs: 900,
        nodeUpdates: { kyc: "complete", nameScreening: "processing" },
        statusText: { nameScreening: "checking PEP / sanctions lists" },
        log: { level: "processing", text: "Name screening started — checking UN, EU, OFAC lists" },
      },
      {
        delayMs: 800,
        nodeUpdates: { nameScreening: "complete", crr: "processing" },
        edgeUpdates: { "nameScreening-crr": true, "crr-tm": true },
        statusText: { nameScreening: "no hits", crr: "calculating risk" },
        log: { level: "success", text: "Screening clear — no hits on any sanctions list" },
      },
      {
        delayMs: 900,
        nodeUpdates: { crr: "complete", tm: "processing" },
        statusText: { crr: "score: LOW", tm: "evaluating transactions" },
        log: { level: "success", text: "CRR complete — score: LOW" },
      },
      {
        delayMs: 1100,
        nodeUpdates: { tm: "complete" },
        statusText: { tm: "no alerts" },
        log: { level: "success", text: "TM clear — no rule violations" },
      },
      {
        delayMs: 700,
        log: { level: "success", text: "Customer onboarded — flow complete" },
      },
    ],
  },

  pep: {
    id: "pep",
    label: "PEP Customer",
    tone: "warn",
    steps: [
      {
        delayMs: 0,
        nodeUpdates: { onboarding: "active" },
        edgeUpdates: { "onboarding-kyc": true },
        statusText: { onboarding: "receiving application" },
        log: { level: "trigger", text: "Onboarding event received — Customer ID #4471" },
      },
      {
        delayMs: 900,
        nodeUpdates: { onboarding: "complete", kyc: "processing" },
        edgeUpdates: { "kyc-nameScreening": true, "kyc-tm": true },
        statusText: { kyc: "dispatching 14 questions" },
        log: { level: "success", text: "KYC QA triggered — 14 questions dispatched" },
      },
      {
        delayMs: 900,
        nodeUpdates: { kyc: "complete", nameScreening: "processing" },
        statusText: { nameScreening: "running PEP screening" },
        log: { level: "processing", text: "Name screening started — running PEP and sanctions check" },
      },
      {
        delayMs: 1000,
        nodeUpdates: { nameScreening: "alert" },
        statusText: { nameScreening: "PEP match detected" },
        log: { level: "warn", text: "Name screening HIT — PEP match detected, routed for review" },
      },
      {
        delayMs: 800,
        nodeUpdates: { crr: "processing" },
        edgeUpdates: { "nameScreening-crr": true, "crr-tm": true },
        statusText: { crr: "recalculating with PEP flag" },
        log: { level: "processing", text: "CRR recalculating — PEP flag applied to risk model" },
      },
      {
        delayMs: 1000,
        nodeUpdates: { crr: "alert" },
        statusText: { crr: "score: MEDIUM-HIGH" },
        log: { level: "warn", text: "CRR updated — new score: MEDIUM-HIGH (PEP match)" },
      },
      {
        delayMs: 800,
        nodeUpdates: { tm: "active" },
        statusText: { tm: "4 rules in scope" },
        log: { level: "trigger", text: "TM rules refreshed — 4 rules now in scope for PEP customer" },
      },
      {
        delayMs: 900,
        nodeUpdates: { kycCase: "alert" },
        edgeUpdates: { "tm-kycCase": true },
        statusText: { kycCase: "EDD case opened" },
        log: { level: "warn", text: "EDD case opened — routed to KYC Case Management for enhanced review" },
      },
      {
        delayMs: 900,
        nodeUpdates: { ai: "active" },
        edgeUpdates: { "ai-tm": true, "ai-kycCase": true },
        statusText: { ai: "analysing risk profile" },
        log: { level: "processing", text: "AI Layer activated — analysing customer risk profile" },
      },
      {
        delayMs: 1100,
        nodeUpdates: { ai: "complete", tm: "complete" },
        statusText: { ai: "recommendation issued", tm: "monitoring" },
        log: { level: "success", text: "AI recommendation: Enhanced review required" },
      },
    ],
  },

  suspicious: {
    id: "suspicious",
    label: "Suspicious Transaction",
    tone: "alert",
    steps: [
      {
        delayMs: 0,
        nodeUpdates: { onboarding: "complete", kyc: "complete", nameScreening: "complete", crr: "complete", tm: "processing" },
        edgeUpdates: {
          "onboarding-kyc": true, "kyc-nameScreening": true, "nameScreening-crr": true,
          "crr-tm": true, "kyc-tm": true,
        },
        statusText: { tm: "ingesting transaction stream" },
        log: { level: "trigger", text: "Live transaction ingest started — account #88241" },
      },
      {
        delayMs: 700,
        log: { level: "processing", text: "TM evaluating — 38 rules across customer segment" },
      },
      {
        delayMs: 900,
        nodeUpdates: { tm: "alert" },
        statusText: { tm: "structuring pattern detected" },
        log: { level: "alert", text: "TM ALERT — structuring pattern across 7 transactions" },
      },
      {
        delayMs: 800,
        nodeUpdates: { ai: "active" },
        edgeUpdates: { "ai-tm": true, "ai-amlCase": true },
        statusText: { ai: "scoring anomaly" },
        log: { level: "processing", text: "AI Layer scoring anomaly — confidence 0.92" },
      },
      {
        delayMs: 900,
        nodeUpdates: { amlCase: "alert" },
        edgeUpdates: { "tm-amlCase": true },
        statusText: { amlCase: "case #C-22841 opened" },
        log: { level: "alert", text: "AML case #C-22841 opened — assigned to investigator queue" },
      },
      {
        delayMs: 900,
        statusText: { amlCase: "SAR flag raised" },
        log: { level: "alert", text: "SAR flag raised — regulator notification queued" },
      },
      {
        delayMs: 800,
        nodeUpdates: { ai: "complete" },
        statusText: { ai: "anomaly highlighted" },
        log: { level: "success", text: "AI recommendation: prioritise for human review" },
      },
    ],
  },

  periodic: {
    id: "periodic",
    label: "Periodic Renewal",
    tone: "ok",
    steps: [
      {
        delayMs: 0,
        nodeUpdates: { onboarding: "complete", kyc: "complete", nameScreening: "complete", crr: "complete", tm: "complete" },
        edgeUpdates: {
          "onboarding-kyc": true, "kyc-nameScreening": true, "nameScreening-crr": true,
          "crr-tm": true, "kyc-tm": true,
        },
        statusText: { tm: "ongoing monitoring" },
        log: { level: "trigger", text: "Periodic review triggered — Customer #2210 (12-month cycle)" },
      },
      {
        delayMs: 800,
        nodeUpdates: { kycCase: "active" },
        edgeUpdates: { "tm-kycCase": true },
        statusText: { kycCase: "review scheduled" },
        log: { level: "processing", text: "KYC Case Management periodic review opened — review interval reached" },
      },
      {
        delayMs: 900,
        nodeUpdates: { kyc: "processing" },
        statusText: { kyc: "sending 8 renewal questions" },
        log: { level: "processing", text: "KYC periodic questionnaire dispatched — 8 questions sent" },
      },
      {
        delayMs: 900,
        nodeUpdates: { nameScreening: "processing" },
        statusText: { nameScreening: "re-screening against latest lists" },
        log: { level: "processing", text: "Name screening re-run — checking against updated PEP / sanctions lists" },
      },
      {
        delayMs: 1000,
        nodeUpdates: { nameScreening: "complete" },
        statusText: { nameScreening: "no new hits" },
        log: { level: "success", text: "Screening clear — no new hits on UN, EU, OFAC lists" },
      },
      {
        delayMs: 800,
        nodeUpdates: { kyc: "complete", crr: "processing" },
        statusText: { crr: "recalculating with latest data" },
        log: { level: "processing", text: "CRR recalculating — incorporating latest transaction behaviour" },
      },
      {
        delayMs: 900,
        nodeUpdates: { ai: "active" },
        edgeUpdates: { "ai-kycCase": true },
        statusText: { ai: "scoring for risk drift" },
        log: { level: "processing", text: "AI Layer activated — checking for risk profile drift" },
      },
      {
        delayMs: 1000,
        nodeUpdates: { crr: "complete", ai: "complete" },
        statusText: { crr: "score: LOW — unchanged", ai: "no drift detected" },
        log: { level: "success", text: "CRR confirmed — score remains LOW, no significant drift" },
      },
      {
        delayMs: 700,
        nodeUpdates: { kycCase: "complete" },
        statusText: { kycCase: "review closed" },
        log: { level: "success", text: "Periodic review complete — customer profile confirmed and updated" },
      },
    ],
  },
};
