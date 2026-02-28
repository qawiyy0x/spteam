import axios from "axios";
import { MINTS } from "./constants.js";
import type { TradeIntent } from "./types.js";

const quoteUrl = process.env.JUPITER_QUOTE_URL ?? "https://quote-api.jup.ag/v6/quote";

function toBaseUnits(intent: TradeIntent): number {
  if (intent.amountUnit === "SOL") return Math.floor(intent.amount * 1_000_000_000);
  return Math.floor(intent.amount * 1_000_000); // USDC 6 decimals
}

export async function getQuote(intent: TradeIntent, slippageBps: number) {
  const inputMint = MINTS[intent.inputSymbol];
  const outputMint = MINTS[intent.outputSymbol];

  const amount = toBaseUnits(intent);

  const { data } = await axios.get(quoteUrl, {
    params: {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      onlyDirectRoutes: false,
    },
    timeout: 15_000,
  });

  return data;
}
