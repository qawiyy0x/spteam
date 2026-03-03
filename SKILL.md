---
name: solana-two-brain-wallet
description: Build and operate a devnet-first Solana agentic wallet with a two-brain decision model (Alpha planner + Guard policy gate). Use when agents must create wallets programmatically, sign transactions automatically, hold SOL/SPL, interact with devnet protocols, and run autonomous loops with safety controls.
---

# Solana Two-Brain Wallet

## What Alpha and Guard do

- **Alpha (planner brain):** proposes an action from command/intent and explains *why*.
- **Guard (risk brain):** validates policy and can `APPROVE`, `REJECT`, or `ESCALATE`.
- **Executor:** only executes when final decision is `APPROVE`.

In API responses/events:
- `alphaReasoning` = Alpha output
- `guardReasoning` + `decision` = Guard output

---

## Defaults

- Network: **Devnet** (`https://api.devnet.solana.com`)
- Safety mode: `DRY_RUN=true` initially
- Cooldown enforced between executions
- No execution if decision is not `APPROVE`

---

## Capability Checklist

1. Programmatic wallet creation
2. Automatic signing
3. SOL/SPL inspection
4. Devnet protocol interaction proof
5. Autonomous loop with policy gate

---

## Stack

- Frontend: React + Vite
- API: Node + TypeScript + Express
- Solana: `@solana/web3.js`
- Validation: `zod`

---

## Setup (local)

```bash
npm install
cp .env.example .env
```

Recommended `.env`:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PATH=.data/wallet.json
DRY_RUN=true
JUPITER_QUOTE_URL=https://lite-api.jup.ag/swap/v1/quote
JUPITER_SWAP_URL=https://lite-api.jup.ag/swap/v1/swap
DEFAULT_MAX_NOTIONAL_USD=50
DEFAULT_MAX_SLIPPAGE_BPS=50
DEFAULT_COOLDOWN_MINUTES=5
```

Run API:

```bash
npm run api:dev
```

### Render persistence (required for stable wallet)
Set `SOLANA_PRIVATE_KEY` in Render env to a fixed base58 secret key.
This prevents wallet rotation across redeploys and keeps one agent identity/address.

Run frontend:

```bash
VITE_API_BASE=http://localhost:3000 npm run dev
```

---

## API Endpoints

### Wallet
- `POST /wallet/create`
- `GET /wallet`

### Protocol proof
- `POST /dapp/memo`

### Agent flow
- `POST /command`
- `POST /debate`
- `POST /override`
- `POST /execute`
- `GET /events`

### Autonomous runtime
- `GET /agent/status`
- `POST /agent/tick`
- `POST /agent/start`
- `POST /agent/stop`

---

## Devnet Proof Flow

```bash
curl -s -X POST http://localhost:3000/wallet/create
curl -s http://localhost:3000/wallet
curl -s -X POST http://localhost:3000/dapp/memo -H 'content-type: application/json' -d '{"memo":"proof"}'
curl -s -X POST http://localhost:3000/agent/tick -H 'content-type: application/json' -d '{"command":"SWAP 0.01 SOL TO USDC SLIPPAGE 30"}'
curl -s http://localhost:3000/events
```

---

## Shared Website Mode (other people’s agents visible on your frontend)

Yes, possible.

Use one shared backend URL (e.g. Render) and point all frontends/agents to it:

- Frontend env: `VITE_API_BASE=https://your-backend-url`
- Agents call the same API (`/agent/tick` or `/agent/start`)
- All runs appear in shared `/events`

**Important:** current event model is shared/global and not yet tenant-isolated. For public multi-user production, add auth + per-agent identity tagging + rate limits.

---

## Policy and Security

- Pair allowlist
- Max notional
- Max slippage
- Cooldown window
- Override threshold
- Keep secrets out of git (`.env`, `.data/*`)

---

## Troubleshooting

- `Attempt to debit...prior credit` → wallet not funded on devnet
- `No signer configured` → call `/wallet/create` or set `SOLANA_PRIVATE_KEY`
- Repeated `REJECT cooldown` → reduce loop frequency or increase loop interval above cooldown
