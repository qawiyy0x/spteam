import { randomUUID } from "crypto";
import { executeJupiterSwap, getQuote } from "./jupiter.js";
import { store } from "./store.js";
import type { DebateResult, Decision, TradeIntent } from "./types.js";

const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() === "true";

function estimateNotionalUsd(intent: TradeIntent): number {
  if (intent.amountUnit === "USDC") return intent.amount;
  const solPrice = 150;
  return intent.amount * solPrice;
}

function alphaReasoning(intent: TradeIntent): string {
  return `Alpha: user requested ${intent.amount} ${intent.amountUnit} from ${intent.inputSymbol} to ${intent.outputSymbol}. This can improve position utility if route quality is acceptable.`;
}

function guardAnalysis(intent: TradeIntent, estNotionalUsd: number, slippageBps: number) {
  const policy = store.policy;
  const pair = `${intent.inputSymbol}/${intent.outputSymbol}` as "SOL/USDC" | "USDC/SOL";

  const violations: string[] = [];

  if (!policy.allowedPairs.includes(pair)) violations.push(`Pair ${pair} is not allowlisted`);
  if (slippageBps > policy.maxSlippageBps) {
    violations.push(`Requested slippage ${slippageBps} > policy max ${policy.maxSlippageBps}`);
  }
  if (estNotionalUsd > policy.maxNotionalUsd) {
    violations.push(`Estimated notional $${estNotionalUsd.toFixed(2)} > max $${policy.maxNotionalUsd.toFixed(2)}`);
  }
  if (store.lastExecutionAt) {
    const elapsedMin = (Date.now() - store.lastExecutionAt) / 60_000;
    if (elapsedMin < policy.cooldownMinutes) {
      violations.push(`Cooldown active (${elapsedMin.toFixed(2)}m < ${policy.cooldownMinutes}m)`);
    }
  }

  const requiresManualOverride = estNotionalUsd >= policy.requireOverrideAboveUsd;

  let decision: Decision = "APPROVE";
  if (violations.length > 0) decision = "REJECT";
  else if (requiresManualOverride) decision = "ESCALATE";

  const guardReasoning = violations.length
    ? `Guard: veto due to ${violations.join("; ")}`
    : requiresManualOverride
      ? `Guard: no policy break, but amount crosses manual override threshold ($${policy.requireOverrideAboveUsd}).`
      : "Guard: policy checks passed. Execution allowed.";

  return { decision, guardReasoning, violations, requiresManualOverride };
}

export async function runDebate(intent: TradeIntent): Promise<DebateResult> {
  const id = randomUUID();
  const slippageBps = intent.requestedSlippageBps ?? store.policy.maxSlippageBps;
  const estNotionalUsd = estimateNotionalUsd(intent);

  let quote: unknown = undefined;
  try {
    quote = await getQuote(intent, slippageBps);
  } catch (e) {
    quote = { quoteError: (e as Error).message };
  }

  const alpha = alphaReasoning(intent);
  const guard = guardAnalysis(intent, estNotionalUsd, slippageBps);

  const result: DebateResult = {
    id,
    createdAt: new Date().toISOString(),
    intent,
    alphaReasoning: alpha,
    guardReasoning: guard.guardReasoning,
    decision: guard.decision,
    violations: guard.violations,
    estimatedNotionalUsd: estNotionalUsd,
    quote,
    requiresManualOverride: guard.requiresManualOverride,
    overrideApproved: false,
    executed: false,
  };

  store.debates.set(id, result);
  return result;
}

export function approveOverride(debateId: string, approved: boolean) {
  const existing = store.debates.get(debateId);
  if (!existing) return null;
  existing.overrideApproved = approved;
  if (approved && existing.decision === "ESCALATE") existing.decision = "APPROVE";
  if (!approved && existing.decision === "ESCALATE") existing.decision = "REJECT";
  store.debates.set(debateId, existing);
  return existing;
}

export async function executeDebate(debateId: string) {
  const existing = store.debates.get(debateId);
  if (!existing) return { error: "Debate not found" };
  if (existing.executed) return { error: "Already executed", debate: existing };
  if (existing.decision !== "APPROVE") {
    return { error: `Cannot execute; decision is ${existing.decision}`, debate: existing };
  }
  if (!existing.quote || typeof existing.quote !== "object" || !("outAmount" in existing.quote)) {
    return { error: "No valid Jupiter quote available on debate", debate: existing };
  }

  try {
    const signature = dryRun
      ? `DRYRUN_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      : await executeJupiterSwap(existing.quote);
    existing.executed = true;
    existing.executionTx = signature;
    store.lastExecutionAt = Date.now();
    store.debates.set(debateId, existing);
    return { debate: existing, tx: signature, simulated: dryRun };
  } catch (e) {
    return {
      error: `Execution failed: ${(e as Error).message}`,
      debate: existing,
    };
  }
}

export function parseCommandToIntent(commandText: string): TradeIntent | null {
  const text = commandText.trim().toUpperCase();
  const match = text.match(/SWAP\s+([0-9]*\.?[0-9]+)\s+(SOL|USDC)\s+TO\s+(SOL|USDC)(?:\s+SLIPPAGE\s+(\d+))?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const inputSymbol = match[2] as "SOL" | "USDC";
  const outputSymbol = match[3] as "SOL" | "USDC";
  const requestedSlippageBps = match[4] ? Number(match[4]) : undefined;
  if (inputSymbol === outputSymbol) return null;

  return {
    inputSymbol,
    outputSymbol,
    amount,
    amountUnit: inputSymbol,
    requestedSlippageBps,
  };
}
