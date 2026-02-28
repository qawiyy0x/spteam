# Deep Dive: Two-Brain Wallet Design

## 1) Wallet Design
Two-Brain Wallet separates decision from execution:
- **Alpha agent** proposes trade intent
- **Guard agent** enforces policy constraints
- **Executor** signs and sends only when allowed

A debate object is produced for each action and includes: intent, reasoning, decision, and violations.

## 2) Security Considerations
- Default environment is **devnet**
- `DRY_RUN=true` by default to avoid accidental mainnet execution
- Hard policy checks (allowlist pairs, notional cap, slippage cap, cooldown)
- Manual override threshold for sensitive size
- Decision gate: execution blocked unless `APPROVE`
- Private key options:
  - env secret (`SOLANA_PRIVATE_KEY`)
  - generated key stored in local file (`SOLANA_WALLET_PATH`)

## 3) AI-Agent Interaction Model
- AI is used for planning/explanation, but deterministic checks own final safety authority
- Human can force approval/rejection on escalated intents
- Debate timeline is exposed via `/events` for observability

## 4) Protocol / dApp Interaction
For devnet prototype proof, wallet signs a transaction to the Solana **Memo Program** via `/dapp/memo`.
This proves programmatic signing + protocol interaction even before swap liquidity setup.

## 5) Devnet Prototype Flow
1. `POST /wallet/create`
2. Fund wallet on devnet faucet
3. `GET /wallet` to verify SOL
4. `POST /dapp/memo` to produce signed devnet tx proof
5. Run debate/override/execute cycle in API/UI
