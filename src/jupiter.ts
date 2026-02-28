import axios from "axios";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { MINTS } from "./constants.js";
import type { TradeIntent } from "./types.js";

const quoteUrl = process.env.JUPITER_QUOTE_URL ?? "https://quote-api.jup.ag/v6/quote";
const swapUrl = process.env.JUPITER_SWAP_URL ?? "https://quote-api.jup.ag/v6/swap";
const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

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

function getSigner() {
  const secret = process.env.SOLANA_PRIVATE_KEY;
  if (!secret) {
    throw new Error("Missing SOLANA_PRIVATE_KEY in environment (base58 secret key)");
  }
  return Keypair.fromSecretKey(bs58.decode(secret));
}

export async function executeJupiterSwap(quoteResponse: unknown): Promise<string> {
  const signer = getSigner();
  const connection = new Connection(rpcUrl, "confirmed");

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
  if (!swapTransactionBase64) {
    throw new Error("Jupiter swap API did not return swapTransaction");
  }

  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransactionBase64, "base64"));
  tx.sign([signer]);

  const signature = await connection.sendTransaction(tx, {
    maxRetries: 2,
    preflightCommitment: "confirmed",
  });

  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({
    signature,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  }, "confirmed");

  return signature;
}
