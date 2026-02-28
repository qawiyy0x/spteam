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

## Stack

- Node 18+
- npm
- TypeScript
- `@solana/web3.js` (tx signing + chain interaction)
- `bs58` (secret decoding)
- `express`, `zod`, `axios`, `dotenv`

## Repository Files Used

- `src/wallet.ts` — wallet create/load, SOL/SPL snapshot, memo tx
- `src/jupiter.ts` — quote + signed swap tx path
- `src/engine.ts` — Alpha/Guard decision engine
- `src/server.ts` — API surface

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

## Required Devnet Proof Flow (submission-grade)

### 1) Create wallet programmatically
```bash
curl -s -X POST http://localhost:3000/wallet/create
```

### 2) Fund wallet on devnet
Use faucet or `solana airdrop`.

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

### 5) Run agent decision loop
```bash
curl -s -X POST http://localhost:3000/command \
  -H 'content-type: application/json' \
  -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}'
```

If `ESCALATE`:
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

## Embedded Scripts (single-file mode)

### Smoke Test Script
```bash
#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:3000}"
curl -fsS "$BASE_URL/health" | jq .
RESP=$(curl -fsS -X POST "$BASE_URL/command" -H 'content-type: application/json' -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}')
echo "$RESP" | jq .
ID=$(echo "$RESP" | jq -r '.id')
curl -fsS "$BASE_URL/events" | jq '.count'
echo "Smoke test complete. debateId=$ID"
```

### Devnet Proof Script
```bash
#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://localhost:3000}"
WALLET=$(curl -fsS -X POST "$BASE_URL/wallet/create")
echo "$WALLET" | jq .
ADDR=$(echo "$WALLET" | jq -r '.publicKey')
echo "Fund this address on devnet before continuing: $ADDR"
read -r -p "Press ENTER when funded..." _
curl -fsS "$BASE_URL/wallet" | jq .
MEMO=$(curl -sS -X POST "$BASE_URL/dapp/memo" -H 'content-type: application/json' -d '{"memo":"two-brain-wallet devnet proof"}')
echo "$MEMO" | jq .
DEBATE=$(curl -fsS -X POST "$BASE_URL/command" -H 'content-type: application/json' -d '{"text":"SWAP 0.05 SOL TO USDC SLIPPAGE 30"}')
echo "$DEBATE" | jq .
ID=$(echo "$DEBATE" | jq -r '.id')
DECISION=$(echo "$DEBATE" | jq -r '.decision')
if [[ "$DECISION" == "ESCALATE" ]]; then
  curl -fsS -X POST "$BASE_URL/override" -H 'content-type: application/json' -d "{\"debateId\":\"$ID\",\"approved\":true}" | jq .
fi
curl -sS -X POST "$BASE_URL/execute" -H 'content-type: application/json' -d "{\"debateId\":\"$ID\"}" | jq .
```

## Policy & Security Rules

- Allowlisted trading pairs only
- Max notional USD
- Max slippage bps
- Cooldown between swaps
- Manual override threshold
- Never commit secrets or wallet files

## Troubleshooting

- `Attempt to debit ... prior credit` → wallet unfunded
- `No signer configured` → set `SOLANA_PRIVATE_KEY` or create wallet
- Swap errors → stay `DRY_RUN=true` until wallet+rpc are verified
