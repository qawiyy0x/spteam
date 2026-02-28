#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "== create wallet =="
WALLET=$(curl -fsS -X POST "$BASE_URL/wallet/create")
echo "$WALLET" | jq .
ADDR=$(echo "$WALLET" | jq -r '.publicKey')

echo "Fund this address on devnet before continuing: $ADDR"
read -r -p "Press ENTER when funded..." _

echo "== wallet snapshot =="
curl -fsS "$BASE_URL/wallet" | jq .

echo "== memo tx proof =="
MEMO=$(curl -sS -X POST "$BASE_URL/dapp/memo" -H 'content-type: application/json' -d '{"memo":"two-brain-wallet devnet proof"}')
echo "$MEMO" | jq .

if echo "$MEMO" | jq -e '.signature' >/dev/null 2>&1; then
  echo "Memo proof success"
else
  echo "Memo proof failed"
  exit 1
fi

echo "== debate and execute =="
DEBATE=$(curl -fsS -X POST "$BASE_URL/command" -H 'content-type: application/json' -d '{"text":"SWAP 0.05 SOL TO USDC SLIPPAGE 30"}')
echo "$DEBATE" | jq .
ID=$(echo "$DEBATE" | jq -r '.id')
DECISION=$(echo "$DEBATE" | jq -r '.decision')

if [[ "$DECISION" == "ESCALATE" ]]; then
  curl -fsS -X POST "$BASE_URL/override" -H 'content-type: application/json' -d "{\"debateId\":\"$ID\",\"approved\":true}" | jq .
fi

curl -sS -X POST "$BASE_URL/execute" -H 'content-type: application/json' -d "{\"debateId\":\"$ID\"}" | jq .

echo "Done"
