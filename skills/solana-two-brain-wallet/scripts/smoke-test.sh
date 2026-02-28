#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

echo "[1] health"
curl -fsS "$BASE_URL/health" | jq .

echo "[2] command -> debate"
RESP=$(curl -fsS -X POST "$BASE_URL/command" \
  -H 'content-type: application/json' \
  -d '{"text":"SWAP 0.1 SOL TO USDC SLIPPAGE 30"}')
echo "$RESP" | jq .

ID=$(echo "$RESP" | jq -r '.id')
if [[ -z "$ID" || "$ID" == "null" ]]; then
  echo "Failed to get debate id"
  exit 1
fi

echo "[3] events"
curl -fsS "$BASE_URL/events" | jq '.count'

echo "Smoke test complete. debateId=$ID"
