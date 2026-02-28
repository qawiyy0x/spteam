---
name: solana-two-brain-wallet
description: "Install and operate a policy-guarded Solana agent wallet (Alpha vs Guard) with devnet-first defaults, automatic signing, and test-dApp interaction."
metadata:
  openclaw:
    emoji: "⚡"
    requires:
      bins: ["node", "npm"]
    install:
      - id: npm
        kind: npm
        package: ""
        bins: ["npm"]
        label: "Install dependencies from package.json"
---

# Solana Two-Brain Wallet Skill

Use this skill when an agent needs to set up and run a **Solana agentic wallet** that:

- creates wallets programmatically
- signs transactions automatically
- holds SOL/SPL tokens
- interacts with a test protocol on devnet
- enforces guardrails before execution

## What this skill installs/uses

Core runtime dependencies already defined in repo:

- `@solana/web3.js` (sign/send transactions)
- `bs58` (decode base58 private keys)
- `express`, `zod`, `dotenv`, `axios`

## Required files

- `src/wallet.ts` (wallet create/load, balance snapshot, memo tx)
- `src/jupiter.ts` (quote + signed swap execution)
- `src/engine.ts` (Alpha/Guard decisioning + policy gates)
- `src/server.ts` (HTTP API)
- `SKILLS.md` (agent quick reference)
- `docs/DEEP_DIVE.md` (design/security write-up)

## Installation

From repo root:

```bash
npm install
cp .env.example .env
```

## Environment (devnet-first)

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

### Key behavior

- If `SOLANA_PRIVATE_KEY` is set, signer loads from env.
- Else signer loads from `SOLANA_WALLET_PATH`.
- If neither exists, create via `POST /wallet/create`.

## Run

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

## Agent operation sequence (recommended)

### 1) Create wallet programmatically
```bash
curl -X POST http://localhost:3000/wallet/create
```

### 2) Fund wallet on devnet
Use Solana faucet to send devnet SOL to returned address.

### 3) Verify wallet holdings (SOL/SPL)
```bash
curl http://localhost:3000/wallet
```

### 4) Prove protocol interaction via signed memo tx
```bash
curl -X POST http://localhost:3000/dapp/memo \
  -H 'content-type: application/json' \
  -d '{"memo":"two-brain-wallet proof"}'
```

### 5) Run policy debate from command text
```bash
curl -X POST http://localhost:3000/command \
  -H 'content-type: application/json' \
  -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}'
```

### 6) Apply override when escalated
```bash
curl -X POST http://localhost:3000/override \
  -H 'content-type: application/json' \
  -d '{"debateId":"<id>","approved":true}'
```

### 7) Execute approved action
```bash
curl -X POST http://localhost:3000/execute \
  -H 'content-type: application/json' \
  -d '{"debateId":"<id>"}'
```

## Safety rails this skill enforces

- Pair allowlist (e.g., SOL/USDC)
- Max notional USD
- Max slippage bps
- Cooldown between executions
- Manual override threshold
- `DRY_RUN=true` default for safe testing

## Production hardening checklist (post-hackathon)

- Move secrets to KMS/HSM, avoid raw private key envs
- Persist policy/debates in durable DB
- Add signature simulation and deterministic quote checks
- Add rate limits + auth for all write endpoints
- Use dedicated RPC with retries and monitoring
- Add unit/integration tests around policy gates

## Success criteria for this skill

An agent using this skill can produce verifiable proof for:

1. wallet creation
2. automatic signing
3. SOL/SPL holdings read
4. devnet protocol interaction
5. guarded agentic execution flow
