---
name: solana-two-brain-wallet
description: Build, install, and operate a devnet-first Solana agentic wallet (Alpha planner + Guard risk gate) that can programmatically create wallets, sign transactions automatically, hold SOL/SPL tokens, interact with test dApps/protocols, and execute policy-constrained swaps. Use when implementing or running autonomous wallet flows for hackathons, demos, or production prototypes on Solana.
---

# Solana Two-Brain Wallet

Use this skill to stand up a **real agent wallet** on Solana devnet with deterministic safety rails.

## Defaults (non-negotiable)

- Network: **Devnet first** (`https://api.devnet.solana.com`)
- Mode: `DRY_RUN=true` until wallet is funded + memo proof works
- Execution gate: never execute unless decision = `APPROVE`
- Human-in-loop: use override for escalated decisions

## Capability Checklist (what this skill guarantees)

1. Programmatic wallet creation
2. Automatic signing of transactions
3. SOL/SPL balance inspection
4. Test dApp/protocol interaction proof on devnet
5. Guarded agentic execution loop (debate → approve/override → execute)

---

## Stack

- Node 18+
- npm
- TypeScript
- `@solana/web3.js` (tx signing + chain interaction)
- `bs58` (secret decoding)
- `express`, `zod`, `axios`, `dotenv`

---

## Repository Files Used

- `src/wallet.ts` — wallet create/load, SOL/SPL snapshot, memo tx
- `src/jupiter.ts` — quote + signed swap tx path
- `src/engine.ts` — Alpha/Guard decision engine
- `src/server.ts` — API surface
- `skills/solana-two-brain-wallet/scripts/smoke-test.sh` — local API smoke test
- `skills/solana-two-brain-wallet/scripts/devnet-proof.sh` — requirement proof runner

---

## Install

From repository root:

```bash
npm install
cp .env.example .env
```

Set `.env`:

```bash
PORT=3000
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=
SOLANA_WALLET_PATH=.data/wallet.json
DRY_RUN=true
JUPITER_QUOTE_URL=https://quote-api.jup.ag/v6/quote
JUPITER_SWAP_URL=https://quote-api.jup.ag/v6/swap
DEFAULT_MAX_NOTIONAL_USD=50
DEFAULT_MAX_SLIPPAGE_BPS=50
DEFAULT_COOLDOWN_MINUTES=5
```

Run:

```bash
npm run dev
```

---

## API Contract (agent-facing)

### Wallet lifecycle
- `POST /wallet/create` → create + persist wallet file
- `GET /wallet` → SOL + SPL snapshot

### Protocol interaction proof
- `POST /dapp/memo` → signed devnet tx to Solana Memo program

### Agentic flow
- `POST /command` → parse text command (`SWAP 0.1 SOL TO USDC SLIPPAGE 30`)
- `POST /debate` → explicit structured intent path
- `POST /override` → manual approve/reject for escalations
- `POST /execute` → execute only when approved
- `GET /events` → debate timeline / observability

---

## Required Devnet Proof Flow (submission-grade)

Execute in order:

### 1) Create wallet programmatically
```bash
curl -s -X POST http://localhost:3000/wallet/create
```

### 2) Fund wallet on devnet
Use one of:
- Solana faucet / wallet UI
- `solana airdrop 2 <PUBKEY> --url devnet` (if CLI installed)

### 3) Verify holdings
```bash
curl -s http://localhost:3000/wallet
```

### 4) Verify signed protocol interaction
```bash
curl -s -X POST http://localhost:3000/dapp/memo \
  -H 'content-type: application/json' \
  -d '{"memo":"two-brain-wallet proof"}'
```

Expected: tx signature + explorer URL (`cluster=devnet`).

### 5) Run agent decision loop
```bash
curl -s -X POST http://localhost:3000/command \
  -H 'content-type: application/json' \
  -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}'
```

If response is `ESCALATE`, approve manually:
```bash
curl -s -X POST http://localhost:3000/override \
  -H 'content-type: application/json' \
  -d '{"debateId":"<ID>","approved":true}'
```

Then execute:
```bash
curl -s -X POST http://localhost:3000/execute \
  -H 'content-type: application/json' \
  -d '{"debateId":"<ID>"}'
```

---

## Policy & Security Rules

Enforce all before execution:

- Allowlisted trading pairs only
- Max notional USD per trade
- Max slippage bps
- Cooldown window between swaps
- Manual override threshold

Operational security:

- Prefer generated wallet file over hardcoded keys
- Never commit `.env` or `.data/wallet.json`
- Keep `DRY_RUN=true` until memo proof is successful
- Use tiny test notionals on first real tx

---

## Troubleshooting

### `Attempt to debit an account but found no prior credit`
Wallet is unfunded. Airdrop/fund devnet SOL first.

### `No signer configured`
Set `SOLANA_PRIVATE_KEY` or call `POST /wallet/create`.

### Jupiter swap errors
- Keep `DRY_RUN=true` during initial testing
- Ensure wallet funded + network reachable
- Retry with lower size and higher slippage bounds (within policy)

---

## Agent Behavior Standard

When used by another agent, always:

1. Prove wallet creation
2. Prove signing via `/dapp/memo`
3. Prove SOL/SPL wallet snapshot
4. Show at least one `REJECT` and one `APPROVE/ESCALATE->APPROVE` case
5. Record tx hashes / explorer links in final output

If any proof step fails, stop and report exact failing step + error text.
