# spteam — Two-Brain Wallet (Alpha vs Guard)

A day-one hackathon build for **Agentic Wallets** on Solana.

## Concept
Two AI roles evaluate every wallet action:
- **Alpha agent** proposes the trade plan
- **Guard agent** enforces policy and can veto/escalate
- Execution only proceeds when decision is `APPROVE`

## Current MVP (API)
- Policy management: `GET/POST /policy`
- Intent validation: `POST /intent`
- Debate engine: `POST /debate`
- Manual override: `POST /override`
- Execution endpoint: `POST /execute` (simulated tx signature for now)
- Timeline feed: `GET /events`

## Stack
- Node + TypeScript + Express
- Zod for schema validation
- Jupiter Quote API for route checks

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```

## Quick test
```bash
curl -X POST http://localhost:3000/debate \
  -H 'content-type: application/json' \
  -d '{
    "intent": {
      "inputSymbol": "SOL",
      "outputSymbol": "USDC",
      "amount": 0.2,
      "amountUnit": "SOL",
      "requestedSlippageBps": 30
    }
  }'
```

Then execute with debate id:
```bash
curl -X POST http://localhost:3000/execute \
  -H 'content-type: application/json' \
  -d '{"debateId":"<id>"}'
```

## Next steps
1. Real signed Jupiter swap execution
2. Minimal frontend dashboard
3. Telegram command bridge via OpenClaw
4. Demo video (approve / reject / escalate+override)
