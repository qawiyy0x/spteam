# Deep Dive: Two-Brain Wallet (Alpha vs Guard)

## 1) System Architecture
Two-Brain Wallet separates responsibilities into clear layers:

1. **Agent Layer**
   - **Alpha**: proposes action plan from user command/intent.
   - **Guard**: validates risk and policy before any execution.
2. **Policy Layer**
   - deterministic checks: pair allowlist, notional cap, slippage cap, cooldown, escalation threshold.
3. **Wallet/Execution Layer**
   - wallet management + signing + transaction submission.
4. **Observability Layer**
   - debate timeline, decisions, violations, tx hashes.

This separation ensures the LLM-like planner does not directly bypass security constraints.

## 2) Agentic Wallet Capabilities (Bounty Mapping)
Implemented capabilities:

- Programmatic wallet creation (`POST /wallet/create`)
- Automatic transaction signing (`POST /dapp/memo`, `POST /execute`)
- SOL/SPL holdings inspection (`GET /wallet`)
- Protocol interaction on devnet (Memo Program proof tx)
- Autonomous operation (`/agent/tick`, `/agent/start`, `/agent/stop`)

## 3) Security Model

### Key management
- signer source priority:
  1) `SOLANA_PRIVATE_KEY` (env)
  2) generated wallet file at `SOLANA_WALLET_PATH`
- wallet file storage is local and must remain gitignored.

### Execution safety
- `DRY_RUN=true` by default.
- execution blocked unless decision is `APPROVE`.
- escalations require explicit override path.
- policy guardrails are deterministic and enforced server-side.

### Threat considerations
- prompt-level misbehavior cannot directly sign tx (Guard + policy gate required).
- accidental mainnet usage reduced via devnet defaults.
- transaction spam constrained by cooldown + notional limits.

## 4) AI Interaction Design
The AI role is planner/analyst; final control is policy-driven:

- Alpha suggests intent-to-action mapping.
- Guard evaluates policy compliance and risk.
- Executor only runs approved actions.
- Human can intervene at escalation points.

This preserves autonomy while maintaining bounded behavior.

## 5) Devnet Demonstration Procedure
1. Create wallet (`POST /wallet/create`)
2. Fund wallet with devnet SOL
3. Verify holdings (`GET /wallet`)
4. Produce signed protocol tx (`POST /dapp/memo`)
5. Run autonomous tick (`POST /agent/tick`)
6. Show events and decision trace (`GET /events`)

## 6) Scalability Path (Multi-agent)
Current architecture supports extension to multiple concurrent agents by:

- assigning one wallet per agent identity
- storing per-agent policy and event streams
- scheduling independent agent loops per wallet

A next-step enhancement is persistent multi-agent state in SQLite/Postgres.
