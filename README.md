# spteam — Two-Brain Wallet (Alpha vs Guard)

A day-one hackathon build for **Agentic Wallets** on Solana.

## Concept
Two AI roles evaluate every wallet action:
- **Alpha agent** proposes the trade plan
- **Guard agent** enforces policy and can veto/escalate
- Execution only proceeds when decision is `APPROVE`

## Current MVP (Phase 2)
- Policy management: `GET/POST /policy`
- Intent validation: `POST /intent`
- Command parser: `POST /command` with text like `SWAP 0.1 SOL TO USDC SLIPPAGE 30`
- Debate engine: `POST /debate`
- Manual override: `POST /override`
- Execution endpoint: `POST /execute` (**real Jupiter signed swap** if `SOLANA_PRIVATE_KEY` set)
- Timeline feed: `GET /events`
- Minimal dashboard UI at `/`

## Stack
- Node + TypeScript + Express
- Zod for schema validation
- Solana Web3.js + Jupiter quote/swap APIs

## Setup
```bash
cp .env.example .env
# add SOLANA_PRIVATE_KEY (base58) to enable real execution
npm install
npm run dev
```

Open browser at:
`http://localhost:3000`

## API quick test
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

## Telegram via OpenClaw (bridge pattern)
Use OpenClaw to receive Telegram text, then POST the message body to `/command`, and relay the result back.
This keeps wallet logic isolated in this API while OpenClaw handles messaging.

## Next steps
1. Persist debates/policy in SQLite/Postgres
2. Add wallet balance + position panel
3. Add strict dry-run mode + simulation diff
4. Demo video (approve / reject / escalate+override)
