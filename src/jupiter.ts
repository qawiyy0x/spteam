import axios from "axios";
import { VersionedTransaction } from "@solana/web3.js";
import { MINTS } from "./constants.js";
import type { TradeIntent } from "./types.js";
import { getConnection, getSigner } from "./wallet.js";

const quoteUrl = process.env.JUPITER_QUOTE_URL ?? "https://quote-api.jup.ag/v6/quote";
const swapUrl = process.env.JUPITER_SWAP_URL ?? "https://quote-api.jup.ag/v6/swap";

function toBaseUnits(intent: TradeIntent): number {
  if (intent.amountUnit === "SOL") return Math.floor(intent.amount * 1_000_000_000);
  return Math.floor(intent.amount * 1_000_000);
}

export async function getQuote(intent: TradeIntent, slippageBps: number) {
  const inputMint = MINTS[intent.inputSymbol];
  const outputMint = MINTS[intent.outputSymbol];
  const amount = toBaseUnits(intent);

  const { data } = await axios.get(quoteUrl, {
    params: { inputMint, outputMint, amount, slippageBps, onlyDirectRoutes: false },
    timeout: 15_000,
  });

  return data;
}

export async function executeJupiterSwap(quoteResponse: unknown): Promise<string> {
  const signer = getSigner();
  const connection = getConnection();

  const { data } = await axios.post(
    swapUrl,
    {
      quoteResponse,
      userPublicKey: signer.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    },
    { timeout: 20_000 }
  );

  const swapTransactionBase64 = data?.swapTransaction as string | undefined;
  if (!swapTransactionBase64) throw new Error("Jupiter swap API did not return swapTransaction");

  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransactionBase64, "base64"));
  tx.sign([signer]);

  const signature = await connection.sendTransaction(tx, { maxRetries: 2, preflightCommitment: "confirmed" });
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({ signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, "confirmed");

  return signature;
}
