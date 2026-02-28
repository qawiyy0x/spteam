import "dotenv/config";
import cors from "cors";
import express from "express";
import { runDebate, approveOverride, executeDebate } from "./engine.js";
import { debateInputSchema, executeSchema, intentSchema, overrideSchema, policySchema } from "./schema.js";
import { store } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "two-brain-wallet-api" });
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

app.post("/execute", (req, res) => {
  const parsed = executeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const out = executeDebate(parsed.data.debateId);
  if ("error" in out) return res.status(400).json(out);
  res.json(out);
});

app.get("/events", (_req, res) => {
  const debates = [...store.debates.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ debates, count: debates.length });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Two-Brain Wallet API running on :${port}`);
});
