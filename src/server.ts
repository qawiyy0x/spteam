import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { runDebate, approveOverride, executeDebate, parseCommandToIntent } from "./engine.js";
import { debateInputSchema, executeSchema, intentSchema, overrideSchema, policySchema } from "./schema.js";
import { store } from "./store.js";
import { createWallet, getWalletSnapshot, sendMemo } from "./wallet.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "two-brain-wallet-api" });
});

app.post("/wallet/create", (_req, res) => {
  const out = createWallet();
  res.json({ ok: true, ...out });
});

app.get("/wallet", async (_req, res) => {
  try {
    const snapshot = await getWalletSnapshot();
    res.json(snapshot);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post("/dapp/memo", async (req, res) => {
  const memo = String(req.body?.memo ?? "Two-Brain Wallet devnet proof");
  try {
    const signature = await sendMemo(memo);
    res.json({ ok: true, signature, memo, explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet` });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.get("/policy", (_req, res) => {
  res.json(store.policy);
});

app.post("/policy", (req, res) => {
  const parsed = policySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  store.policy = parsed.data;
  res.json({ ok: true, policy: store.policy });
});

app.post("/intent", (req, res) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json({ ok: true, normalizedIntent: parsed.data });
});

app.post("/command", async (req, res) => {
  const text = String(req.body?.text ?? "");
  const intent = parseCommandToIntent(text);
  if (!intent) return res.status(400).json({ error: "Invalid command. Example: SWAP 0.1 SOL TO USDC SLIPPAGE 30" });
  const result = await runDebate(intent);
  res.json(result);
});

app.post("/debate", async (req, res) => {
  const parsed = debateInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const result = await runDebate(parsed.data.intent);
  res.json(result);
});

app.post("/override", (req, res) => {
  const parsed = overrideSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = approveOverride(parsed.data.debateId, parsed.data.approved);
  if (!updated) return res.status(404).json({ error: "Debate not found" });
  res.json(updated);
});

app.post("/execute", async (req, res) => {
  const parsed = executeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const out = await executeDebate(parsed.data.debateId);
  if ("error" in out) return res.status(400).json(out);
  res.json(out);
});

app.get("/events", (_req, res) => {
  const debates = [...store.debates.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ debates, count: debates.length });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Two-Brain Wallet API running on :${port}`);
});
