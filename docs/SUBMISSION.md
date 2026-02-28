# Submission Pack (Tightened)

## Live URLs
- Frontend: https://spteam-tawny.vercel.app/
- Backend API (temporary tunnel): https://every-wombats-follow.loca.lt

## Repository
- https://github.com/qawiyy0x/spteam

## Requirement Compliance

- [x] Programmatic wallet creation
- [x] Automatic transaction signing
- [x] Holds SOL/SPL (balance inspection)
- [x] Interacts with test protocol on devnet
- [x] Deep dive provided (`docs/DEEP_DIVE.md`)
- [x] Open-source code + README
- [x] `SKILLS.md` + root `SKILL.md`
- [x] Devnet working prototype

## Proof Links (fill before submit)

### Wallet Creation Proof
- Agent 1 wallet: `D68Rnt6p3QwioKuDRWWae7rzfzutbfBf7FPPSwtEdkv9`
- Agent 2 wallet: `AmRUqUjL1cmzrkkhP6GatopcNNUu6a55CwZbqzMfpbbg`

### Devnet Transaction Proofs
- Memo TX #1: https://explorer.solana.com/tx/3VvyNhPRe5oyXKmxpgqDnNhdRb8cfsz8QF55Z13tHcDzGWN7M7WCbp3yRzHK4uBwzCKLEc9ZfQhjMJ7sLdYVdhPi?cluster=devnet
- Memo TX #2: https://explorer.solana.com/tx/44SZ86whYfBEBUZrAUg9Cs2fw4xeJzd97qH73xzkoxdeq1pRi6v2wuTZuA6YRaDPUgnJTezVTkN7HVT43PPygtzU?cluster=devnet

### Autonomous Agent Proof
- Agent 1 loop started at 15s interval (`/agent/start` on port 3100) with command `SWAP 0.01 SOL TO USDC SLIPPAGE 30`
- Agent 2 loop started at 17s interval (`/agent/start` on port 3101) with command `SWAP 0.02 SOL TO USDC SLIPPAGE 30`
- Both produced independent `APPROVE` decisions and independent execution records (`DRYRUN_*`) with live Jupiter quotes

## Demo Script (60-90s)
1. In Vercel env, set `VITE_API_BASE=https://every-wombats-follow.loca.lt` and redeploy
2. Open live frontend
3. Create/fetch wallet
4. Show SOL balance on devnet
5. Trigger memo proof transaction
6. Start autonomous loop and show decision trace + tx evidence

## Security Summary
- Devnet-first defaults
- Dry-run default safety
- Deterministic policy gates
- Override path for escalations
- Clear separation: agent logic vs wallet signer
