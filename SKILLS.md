# SKILLS.md

This repository is built for agent execution.

## Primary Agent Tasks
1. Run policy-driven wallet debates (`/debate`)
2. Parse command text (`/command`) in format:
   - `SWAP <amount> <SOL|USDC> TO <SOL|USDC> [SLIPPAGE <bps>]`
3. Enforce guardrails before execution (`/execute`)
4. Support human override flow (`/override`)
5. Manage wallet lifecycle (`/wallet/create`, `/wallet`)
6. Verify devnet dApp interaction (`/dapp/memo`)

## Safe Defaults
- Use devnet RPC by default (`https://api.devnet.solana.com`)
- Never execute if decision != APPROVE
- Prefer dry-run / small notional tests first

## Operational Notes
- Real transaction signing requires a signer via `SOLANA_PRIVATE_KEY` or generated wallet file.
- Generated wallet is stored at `SOLANA_WALLET_PATH` (default `.data/wallet.json`).
