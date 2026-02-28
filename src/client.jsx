import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const css = `
:root{--bg:#0b1020;--panel:#121a2f;--line:#263354;--text:#e8eeff;--muted:#a8b4d6;--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444;--blue:#3b82f6}
*{box-sizing:border-box}
body{background:radial-gradient(900px 300px at 0 -10%,#1e3a8a55,transparent),var(--bg);color:var(--text)}
.wrap{max-width:980px;margin:0 auto;padding:20px 14px 40px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.h{font-size:24px;font-weight:800}.sub{color:var(--muted);font-size:13px}
.badge{padding:5px 9px;border:1px solid var(--line);border-radius:999px;background:#0f1730;font-size:12px}
.grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:920px){.grid{grid-template-columns:1fr 1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px}
.k{font-size:12px;color:var(--muted)}.v{font-size:16px;font-weight:700}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
input,button{background:#0d1530;border:1px solid var(--line);color:var(--text);padding:9px 10px;border-radius:9px}
button{cursor:pointer;font-weight:700}.primary{background:var(--blue);border-color:#5d94ff}.ok{background:#17341f;border-color:#2f7f4d}.warn{background:#3b2b13;border-color:#8f6b22}.bad{background:#391b1b;border-color:#914141}
.entry{border:1px solid var(--line);border-radius:10px;padding:10px;margin-top:8px;background:#0d152a}
.muted{color:var(--muted);font-size:12px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;word-break:break-all}
.dot{width:9px;height:9px;border-radius:50%;display:inline-block;background:#64748b;margin-right:6px}.dot.live{background:var(--ok)}
.state{font-size:11px;border:1px solid;padding:2px 7px;border-radius:999px;font-weight:700}
.approve{color:#bbf7d0;border-color:#1f6f45}.reject{color:#fecaca;border-color:#8d2f2f}.escalate{color:#fde68a;border-color:#8f6b22}
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

  const refresh = async () => {
    try {
      const [w, s, e] = await Promise.all([jf("/wallet"), jf("/agent/status"), jf("/events")]);
      setWallet(w); setStatus(s); setEvents(e.debates || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, []);

  const runTick = () => jf("/agent/tick", { method: "POST", body: JSON.stringify({ command: status.command }) }).then(refresh).catch(e => alert(e.message));
  const startLoop = () => jf("/agent/start", { method: "POST", body: JSON.stringify({ command: status.command, intervalSec: status.intervalSec || 60 }) }).then(refresh).catch(e => alert(e.message));
  const stopLoop = () => jf("/agent/stop", { method: "POST", body: "{}" }).then(refresh).catch(e => alert(e.message));
  const createWallet = () => jf("/wallet/create", { method: "POST", body: "{}" }).then(refresh).catch(e => alert(e.message));
  const sendProof = () => jf("/dapp/memo", { method: "POST", body: JSON.stringify({ memo: `agent-proof-${Date.now()}` }) }).then(refresh).catch(e => alert(e.message));

  return (
    <div className="wrap">
      <style>{css}</style>
      <div className="top">
        <div>
          <div className="h">Agent Activity Dashboard <span className="muted">React v5</span></div>
          <div className="sub">Shows live autonomous agent work on Solana devnet.</div>
        </div>
        <div className="badge">DEVNET</div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="k">Wallet</div>
          <div className="v mono">{wallet?.publicKey || "not initialized"}</div>
          <div className="row" style={{marginTop:8}}>
            <div className="k">SOL:</div><div className="v">{wallet?.sol ?? "-"}</div>
            <div className="k">Loop:</div><div className="v"><span className={`dot ${status.running ? "live" : ""}`}></span>{status.running ? "running" : "idle"}</div>
          </div>
          <div className="row" style={{marginTop:10}}>
            <button className="primary" onClick={createWallet}>Create Wallet</button>
            <button className="ok" onClick={sendProof}>Send Proof Tx</button>
            <button onClick={refresh}>Refresh</button>
          </div>
        </div>

        <div className="card">
          <div className="k">Autonomous Agent Controls</div>
          <div className="row" style={{marginTop:8}}>
            <input style={{flex:1}} value={status.command || ""} onChange={(e) => setStatus({ ...status, command: e.target.value })} />
            <input style={{width:90}} type="number" min="10" value={status.intervalSec || 60} onChange={(e) => setStatus({ ...status, intervalSec: Number(e.target.value) })} />
          </div>
          <div className="row" style={{marginTop:10}}>
            <button className="ok" onClick={startLoop}>Start</button>
            <button className="warn" onClick={runTick}>Run Tick</button>
            <button className="bad" onClick={stopLoop}>Stop</button>
          </div>
          <div className="muted" style={{marginTop:10}}>lastRun: {status.lastRunAt || "-"} {status.lastError ? `| error: ${status.lastError}` : ""}</div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="k">Live Agent Events</div>
        {events.length === 0 && <div className="muted" style={{marginTop:8}}>No events yet.</div>}
        {events.map((d) => (
          <div className="entry" key={d.id}>
            <div className="row" style={{justifyContent:"space-between"}}>
              <strong>{d.intent.inputSymbol}→{d.intent.outputSymbol} ({d.intent.amount} {d.intent.amountUnit})</strong>
              <span className={`state ${d.decision.toLowerCase()}`}>{d.decision}</span>
            </div>
            <div className="muted">{new Date(d.createdAt).toLocaleString()}</div>
            <div className="muted" style={{marginTop:6}}>{d.guardReasoning}</div>
            <div className="mono muted" style={{marginTop:6}}>tx: {d.executionTx || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
