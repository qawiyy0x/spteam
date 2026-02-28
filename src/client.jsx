import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const styles = `
:root{--bg:#f6f7fb;--text:#101216;--muted:#5d6c7b;--line:#e6ebf2;--panel:#fff;--blue:#0082f3;--good:#16a34a;--warn:#f59e0b;--bad:#ef4444}
*{box-sizing:border-box} body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--text)}
.wrap{max-width:1180px;margin:0 auto;padding:24px 18px 56px}
.nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px}
.brand{font-weight:800;letter-spacing:-.02em;font-size:22px}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 12px;color:var(--muted);font-size:12px}
.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:14px;margin-bottom:14px}
@media(max-width:980px){.hero{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 1px 2px rgba(16,24,40,.04)}
.headline{font-size:44px;line-height:1.02;letter-spacing:-.03em;margin:0 0 12px}
.sub{color:var(--muted);font-size:15px;line-height:1.5;margin:0}
.score{display:flex;align-items:baseline;gap:10px;margin-top:16px}.score .n{font-size:56px;font-weight:800;color:var(--blue);letter-spacing:-.03em}.score .l{color:var(--muted)}
.scams{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.tag{padding:6px 10px;border-radius:999px;border:1px solid var(--line);font-size:12px;color:#334155;background:#fafcff}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
@media(min-width:900px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
.stat .k{font-size:11px;text-transform:uppercase;color:var(--muted)}.stat .v{margin-top:6px;font-size:15px;font-weight:700}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.grid-3{display:grid;grid-template-columns:1fr;gap:14px}@media(min-width:1020px){.grid-3{grid-template-columns:1fr 1fr}}
input,button{border:1px solid var(--line);border-radius:10px;background:#fff;padding:10px 12px;font-size:14px;color:var(--text)}
button{font-weight:700;cursor:pointer}button:hover{background:#f4f8ff}
.primary{background:var(--blue);border-color:var(--blue);color:#fff}.primary:hover{background:#0074db}
.good{background:#f0fdf4;border-color:#bbf7d0;color:#166534}.warn{background:#fffbeb;border-color:#fde68a;color:#92400e}.bad{background:#fef2f2;border-color:#fecaca;color:#991b1b}
.row{display:flex;gap:8px;flex-wrap:wrap}.muted{color:var(--muted);font-size:13px;line-height:1.45}.mt{margin-top:10px}
.entry{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px;background:#fff}
.badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 8px;border:1px solid}.approve{color:#166534;background:#f0fdf4;border-color:#bbf7d0}.reject{color:#991b1b;background:#fef2f2;border-color:#fecaca}.escalate{color:#92400e;background:#fffbeb;border-color:#fde68a}
`; 

const jf = async (url, opts = {}) => {
  const res = await fetch(url, { headers: { "content-type": "application/json", ...(opts.headers || {}) }, ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
};

function App() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState({ running: false, intervalSec: 60, command: "SWAP 0.05 SOL TO USDC SLIPPAGE 30" });
  const [events, setEvents] = useState([]);
  const [cmd, setCmd] = useState("SWAP 0.1 SOL TO USDC SLIPPAGE 30");
  const [agentCmd, setAgentCmd] = useState("SWAP 0.05 SOL TO USDC SLIPPAGE 30");
  const [intervalSec, setIntervalSec] = useState(60);

  const refreshWallet = async () => { try { setWallet(await jf("/wallet")); } catch (e) { setWallet({ error: e.message }); } };
  const refreshStatus = async () => setStatus(await jf("/agent/status"));
  const refreshEvents = async () => setEvents((await jf("/events")).debates || []);
  const refreshAll = async () => Promise.all([refreshWallet(), refreshStatus(), refreshEvents()]);

  useEffect(() => {
    refreshAll();
    const a = setInterval(refreshStatus, 7000);
    const b = setInterval(refreshEvents, 10000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const action = async (url, payload) => {
    try { await jf(url, { method: "POST", body: JSON.stringify(payload) }); await refreshAll(); }
    catch (e) { alert(e.message); }
  };

  const badge = (d) => (d === "APPROVE" ? "approve" : d === "REJECT" ? "reject" : "escalate");

  return (
    <div className="wrap">
      <style>{styles}</style>
      <div className="nav">
        <div className="brand">Two-Brain Wallet <span style={{color:"#8a98b3",fontWeight:600,fontSize:13}}>React v4</span></div>
        <div className="pill">Solana Devnet</div>
      </div>

      <div className="hero">
        <div className="card">
          <h1 className="headline">Reputation & Credibility, Onchain.</h1>
          <p className="sub">Agentic wallet decisions are debated by Alpha vs Guard, then executed with policy constraints and verifiable transaction proofs.</p>
          <div className="score"><div className="n">{events.length || 0}</div><div className="l">debates recorded</div></div>
          <div className="scams">
            {["Rugpulls","Phishing","Wash Trading","Front Running","Sybil Attacks","Spoofing"].map(t => <span className="tag" key={t}>{t}</span>)}
          </div>
        </div>
        <div className="card">
          <h3 style={{marginTop:0}}>Wallet Snapshot</h3>
          <div className="muted">Address</div>
          <div className="mono" style={{fontSize:12,marginTop:4}}>{wallet?.publicKey || "-"}</div>
          <div className="grid mt">
            <div><div className="muted">SOL</div><div style={{fontWeight:700,fontSize:20}}>{wallet?.sol ?? "-"}</div></div>
            <div><div className="muted">Loop</div><div style={{fontWeight:700,fontSize:20}}>{status.running ? "Running" : "Idle"}</div></div>
          </div>
          <div className="row mt">
            <button className="primary" onClick={() => action('/wallet/create', {})}>Create Wallet</button>
            <button onClick={refreshWallet}>Refresh</button>
            <button className="good" onClick={() => action('/dapp/memo', { memo: `proof-${Date.now()}` })}>Send Memo Proof</button>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="card stat"><div className="k">Wallet</div><div className="v mono">{wallet?.publicKey ? `${wallet.publicKey.slice(0,6)}...${wallet.publicKey.slice(-6)}` : "-"}</div></div>
        <div className="card stat"><div className="k">SOL Balance</div><div className="v">{wallet?.sol ?? "-"}</div></div>
        <div className="card stat"><div className="k">Agent Loop</div><div className="v">{status.running ? "running" : "idle"}</div></div>
        <div className="card stat"><div className="k">Last Run</div><div className="v">{status.lastRunAt ? new Date(status.lastRunAt).toLocaleTimeString() : "-"}</div></div>
      </div>

      <div className="grid-3">
        <div className="card">
          <h3 style={{marginTop:0}}>Manual Command</h3>
          <p className="muted">Use: <code>SWAP 0.1 SOL TO USDC SLIPPAGE 30</code></p>
          <div className="row"><input style={{flex:1}} value={cmd} onChange={e=>setCmd(e.target.value)} /><button className="primary" onClick={()=>action('/command',{text:cmd})}>Run Debate</button></div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Autonomous Agent Loop</h3>
          <div className="row"><input style={{flex:1}} value={agentCmd} onChange={e=>setAgentCmd(e.target.value)} /><input type="number" min="10" value={intervalSec} onChange={e=>setIntervalSec(Number(e.target.value))} style={{width:100}} /></div>
          <div className="row mt">
            <button className="good" onClick={()=>action('/agent/start',{command:agentCmd,intervalSec})}>Start</button>
            <button className="warn" onClick={()=>action('/agent/tick',{command:agentCmd})}>Run Tick</button>
            <button className="bad" onClick={()=>action('/agent/stop',{})}>Stop</button>
          </div>
          <p className="muted mt">running={String(status.running)} · interval={status.intervalSec}s · command={status.command}</p>
        </div>
      </div>

      <div className="card mt">
        <h3 style={{marginTop:0}}>Debate Timeline</h3>
        {events.map((d) => (
          <div key={d.id} className="entry">
            <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
              <div><strong>{d.intent.inputSymbol}→{d.intent.outputSymbol}</strong> <span className="muted">{d.intent.amount} {d.intent.amountUnit}</span></div>
              <span className={`badge ${badge(d.decision)}`}>{d.decision}</span>
            </div>
            <div className="muted">{new Date(d.createdAt).toLocaleString()}</div>
            <div className="muted mt">{d.alphaReasoning}</div>
            <div className="muted">{d.guardReasoning}</div>
            <div className="muted mono mt">TX: {d.executionTx || "-"}</div>
            <div className="row mt">
              <button onClick={() => action('/override', { debateId: d.id, approved: true })}>Override Approve</button>
              <button onClick={() => action('/override', { debateId: d.id, approved: false })}>Override Reject</button>
              <button className="primary" onClick={() => action('/execute', { debateId: d.id })}>Execute</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
