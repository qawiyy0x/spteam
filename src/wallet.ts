import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const walletPath = process.env.SOLANA_WALLET_PATH ?? ".data/wallet.json";

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });
}

export function createWallet() {
  const kp = Keypair.generate();
  ensureDir(walletPath);
  writeFileSync(walletPath, JSON.stringify(Array.from(kp.secretKey)));
  return {
    publicKey: kp.publicKey.toBase58(),
    walletPath,
  };
}

export function getSigner(): Keypair {
  const envSecret = process.env.SOLANA_PRIVATE_KEY;
  if (envSecret) return Keypair.fromSecretKey(bs58.decode(envSecret));

  if (existsSync(walletPath)) {
    const arr = JSON.parse(readFileSync(walletPath, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  }

  throw new Error("No signer configured. Set SOLANA_PRIVATE_KEY or call POST /wallet/create");
}

export function getConnection() {
  return new Connection(rpcUrl, "confirmed");
}

export async function getWalletSnapshot() {
  const signer = getSigner();
  const conn = getConnection();
  const lamports = await conn.getBalance(signer.publicKey);

  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(signer.publicKey, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  const tokens = tokenAccounts.value
    .map((a) => {
      const info = a.account.data.parsed.info;
      return {
        mint: info.mint as string,
        amount: Number(info.tokenAmount.uiAmount || 0),
        decimals: Number(info.tokenAmount.decimals || 0),
      };
    })
    .filter((t) => t.amount > 0);

  return {
    publicKey: signer.publicKey.toBase58(),
    sol: lamports / LAMPORTS_PER_SOL,
    tokens,
    rpcUrl,
  };
}

export async function sendMemo(memo: string) {
  const signer = getSigner();
  const conn = getConnection();

  const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
  const ix = new TransactionInstruction({
    keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: false }],
    programId: memoProgramId,
    data: Buffer.from(memo, "utf8"),
  });

  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransaction(conn, tx, [signer], {
    commitment: "confirmed",
  });

  return signature;
}
