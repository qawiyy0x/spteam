import type { DebateResult, Policy } from "./types.js";

const defaultPolicy: Policy = {
  maxNotionalUsd: Number(process.env.DEFAULT_MAX_NOTIONAL_USD ?? 50),
  maxSlippageBps: Number(process.env.DEFAULT_MAX_SLIPPAGE_BPS ?? 50),
  cooldownMinutes: Number(process.env.DEFAULT_COOLDOWN_MINUTES ?? 5),
  allowedPairs: ["SOL/USDC", "USDC/SOL"],
  requireOverrideAboveUsd: 25,
};

class InMemoryStore {
  policy: Policy = defaultPolicy;
  debates = new Map<string, DebateResult>();
  lastExecutionAt: number | null = null;
}

export const store = new InMemoryStore();
