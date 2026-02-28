export type Decision = "APPROVE" | "REJECT" | "ESCALATE";

export type TradeIntent = {
  inputSymbol: "SOL" | "USDC";
  outputSymbol: "SOL" | "USDC";
  amount: number;
  amountUnit: "SOL" | "USDC";
  requestedSlippageBps?: number;
};

export type Policy = {
  maxNotionalUsd: number;
  maxSlippageBps: number;
  cooldownMinutes: number;
  allowedPairs: Array<"SOL/USDC" | "USDC/SOL">;
  requireOverrideAboveUsd: number;
};

export type DebateResult = {
  id: string;
  createdAt: string;
  intent: TradeIntent;
  alphaReasoning: string;
  guardReasoning: string;
  decision: Decision;
  violations: string[];
  estimatedNotionalUsd: number;
  quote?: unknown;
  requiresManualOverride: boolean;
  overrideApproved: boolean;
  executed: boolean;
  executionTx?: string;
};
