# spteam — Two-Brain Wallet (Alpha vs Guard)

A day-one hackathon build for **Agentic Wallets** on Solana.

## Requirement Checklist
- [x] Programmatically create wallet (`POST /wallet/create`)
- [x] Automatic signing (memo + swap execution paths)
- [x] Hold SOL/SPL and inspect balances (`GET /wallet`)
- [x] Interact with test dApp/protocol on devnet (`POST /dapp/memo`)
- [x] Open-source code + setup docs
- [x] `SKILLS.md` for agents
- [x] Deep dive doc (`docs/DEEP_DIVE.md`)

## Concept
Two AI roles evaluate every wallet action:
- **Alpha agent** proposes the trade plan
- **Guard agent** enforces policy and can veto/escalate
- Execution only proceeds when decision is `APPROVE`

## Current MVP (Phase 3)
- Wallet creation: `POST /wallet/create`
- Wallet snapshot (SOL + SPL): `GET /wallet`
- Devnet dApp interaction: `POST /dapp/memo`
- Policy management: `GET/POST /policy`
- Intent validation: `POST /intent`
- Command parser: `POST /command` with `SWAP 0.1 SOL TO USDC SLIPPAGE 30`
- Debate engine: `POST /debate`
- Manual override: `POST /override`
- Execution endpoint: `POST /execute` (dry-run by default; real signed Jupiter swap when configured)
- Timeline feed: `GET /events`
- Live dashboard UI at `/` (wallet status, memo proof, debates, autonomous agent loop)
- Autonomous agent endpoints: `/agent/status`, `/agent/tick`, `/agent/start`, `/agent/stop`

## Stack
- Node + TypeScript + Express
- Zod schema validation
- Solana Web3.js + Jupiter APIs

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```

Open browser:
`http://localhost:3000`

## Devnet Prototype (required path)
1. Create wallet:
```bash
curl -X POST http://localhost:3000/wallet/create
```
2. Fund the returned address from devnet faucet.
3. Check balances:
```bash
curl http://localhost:3000/wallet
```
4. Send memo tx (protocol interaction proof):
```bash
curl -X POST http://localhost:3000/dapp/memo \
  -H 'content-type: application/json' \
  -d '{"memo":"two-brain-wallet proof"}'
```

## Debate Flow Test
```bash
curl -X POST http://localhost:3000/command \
  -H 'content-type: application/json' \
  -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}'
```

Then execute with debate id:
```bash
curl -X POST http://localhost:3000/execute \
  -H 'content-type: application/json' \
  -d '{"debateId":"<id>"}'
```

## Safety Defaults
- `SOLANA_RPC_URL=https://api.devnet.solana.com`
- `DRY_RUN=true`
- Strict policy guardrails + override path

## Docs
- Design deep dive: `docs/DEEP_DIVE.md`
- Agent instructions: `SKILLS.md`
