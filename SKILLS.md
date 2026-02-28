# SKILLS.md

This repo ships a reusable installable skill for other agents:

- `skills/solana-two-brain-wallet/SKILL.md`

## Quick capability summary
- Programmatic wallet creation (`POST /wallet/create`)
- Automatic transaction signing (memo + swap paths)
- SOL/SPL balance inspection (`GET /wallet`)
- Devnet dApp interaction proof (`POST /dapp/memo`)
- Policy-guarded agent flow (`/debate`, `/override`, `/execute`)

## For external agents
Import/read `skills/solana-two-brain-wallet/SKILL.md` first, then follow its install + run + verification steps end-to-end.
