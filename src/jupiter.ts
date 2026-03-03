import axios from "axios";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
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
    params: {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      onlyDirectRoutes: false,
      asLegacyTransaction: true,
    },
    timeout: 15_000,
  });

  return data;
}

export async function executeJupiterSwap(quoteResponse: unknown): Promise<string> {
  const signer = getSigner();
  const connection = getConnection();

  const sendOnce = async () => {
    const { data } = await axios.post(
      swapUrl,
      {
        quoteResponse,
        userPublicKey: signer.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
        asLegacyTransaction: true,
      },
      { timeout: 20_000 }
    );

    const swapTransactionBase64 = data?.swapTransaction as string | undefined;
    if (!swapTransactionBase64) throw new Error("Jupiter swap API did not return swapTransaction");

    const txBytes = Buffer.from(swapTransactionBase64, "base64");

    try {
      const vtx = VersionedTransaction.deserialize(txBytes);
      vtx.sign([signer]);
      const signature = await connection.sendTransaction(vtx, { maxRetries: 2, preflightCommitment: "confirmed" });
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({ signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, "confirmed");
      return signature;
    } catch {
      const ltx = Transaction.from(txBytes);
      ltx.sign(signer);
      const signature = await connection.sendRawTransaction(ltx.serialize(), { maxRetries: 2, preflightCommitment: "confirmed" });
      await connection.confirmTransaction(signature, "confirmed");
      return signature;
    }
  };

  try {
    return await sendOnce();
  } catch (e) {
    const msg = (e as Error).message || "";
    if (msg.toLowerCase().includes("blockhash not found")) {
      return await sendOnce();
    }
    throw e;
  }
}
