import { z } from "zod";

export const policySchema = z.object({
  maxNotionalUsd: z.number().positive(),
  maxSlippageBps: z.number().int().min(1).max(1000),
  cooldownMinutes: z.number().int().min(0).max(1440),
  allowedPairs: z.array(z.enum(["SOL/USDC", "USDC/SOL"]))
    .nonempty(),
  requireOverrideAboveUsd: z.number().nonnegative(),
});

export const intentSchema = z.object({
  inputSymbol: z.enum(["SOL", "USDC"]),
  outputSymbol: z.enum(["SOL", "USDC"]),
  amount: z.number().positive(),
  amountUnit: z.enum(["SOL", "USDC"]),
  requestedSlippageBps: z.number().int().positive().max(1000).optional(),
});

export const debateInputSchema = z.object({
  intent: intentSchema,
});

export const overrideSchema = z.object({
  debateId: z.string().min(1),
  approved: z.boolean(),
});

export const executeSchema = z.object({
  debateId: z.string().min(1),
});
