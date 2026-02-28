import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const styles = `
:root { --bg:#0b0f17; --panel:#121826; --text:#edf2ff; --muted:#9fafc9; --line:#26324a; --accent:#3b82f6; --good:#22c55e; --warn:#f59e0b; --bad:#ef4444; }
*{box-sizing:border-box} body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:radial-gradient(1000px 350px at 10% -10%,#1d4ed833,transparent),var(--bg);color:var(--text)}
.container{max-width:1180px;margin:0 auto;padding:28px 18px 48px}.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}
h1{margin:0;font-size:34px;letter-spacing:-.02em}.sub{margin:6px 0 0;color:var(--muted)}.pill{border:1px solid var(--line);background:#0f1626;border-radius:999px;padding:7px 12px;font-size:12px;color:#c8d5f2}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px}@media(min-width:900px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
.card{background:linear-gradient(180deg,#111a2c,#0f1727);border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:0 10px 30px #00000040}.stat .k{font-size:11px;text-transform:uppercase;color:var(--muted);letter-spacing:.04em}.stat .v{margin-top:6px;font-size:15px;font-weight:600}
.layout{display:grid;grid-template-columns:1fr;gap:14px}@media(min-width:1020px){.layout{grid-template-columns:1.1fr .9fr}}
.section-title{margin:0 0 10px;font-size:16px}.muted{color:var(--muted);font-size:13px;line-height:1.45}.row{display:flex;flex-wrap:wrap;gap:8px}.mt{margin-top:10px}
input,button{border:1px solid var(--line);border-radius:10px;background:#0d1525;color:var(--text);padding:10px 12px;font-size:14px}input{min-width:120px}button{cursor:pointer;font-weight:600}
.primary{background:var(--accent);color:#fff;border-color:#4b8cff}.good{color:#d5ffe4;border-color:#2f7f4d;background:#163524}.warn{color:#ffe9c3;border-color:#a56f1e;background:#3a2a13}.danger{color:#ffd4d4;border-color:#914141;background:#391b1b}
.timeline .entry{border:1px solid var(--line);background:#0b1322;border-radius:12px;padding:11px;margin-bottom:9px}.badge{font-size:11px;font-weight:700;border-radius:999px;padding:4px 8px;border:1px solid}
.approve{color:#bbf7d0;background:#052e1a;border-color:#1f6f45}.reject{color:#fecaca;background:#3a1313;border-color:#8d2f2f}.escalate{color:#fde68a;background:#3d2e11;border-color:#8f6b22}
code{color:#9ed0ff;background:#0b1f3a;padding:2px 5px;border-radius:6px}.dot{width:10px;height:10px;border-radius:50%;background:#64748b;display:inline-block;margin-right:6px}.dot.live{background:var(--good)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
`;

const jf = async (url, opts={}) => {
  const res = await fetch(url, { headers: {"content-type":"application/json", ...(opts.headers||{})}, ...opts});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
};

function App(){
  const [wallet,setWallet]=useState(null);
  const [status,setStatus]=useState({running:false,intervalSec:60,command:"SWAP 0.05 SOL TO USDC SLIPPAGE 30"});
  const [events,setEvents]=useState([]);
  const [cmd,setCmd]=useState("SWAP 0.1 SOL TO USDC SLIPPAGE 30");
  const [agentCmd,setAgentCmd]=useState("SWAP 0.05 SOL TO USDC SLIPPAGE 30");
  const [intervalSec,setIntervalSec]=useState(60);

  const refreshWallet = async()=>{ try{ setWallet(await jf('/wallet')); }catch(e){ setWallet({error:e.message}); } };
  const refreshStatus = async()=> setStatus(await jf('/agent/status'));
  const refreshEvents = async()=> setEvents((await jf('/events')).debates || []);
  const refreshAll = async()=> Promise.all([refreshWallet(),refreshStatus(),refreshEvents()]);

  useEffect(()=>{ refreshAll(); const a=setInterval(refreshStatus,8000); const b=setInterval(refreshEvents,12000); return ()=>{clearInterval(a);clearInterval(b)}; },[]);

  const action = async (url,payload)=>{ try{ await jf(url,{method:'POST',body:JSON.stringify(payload)}); await refreshAll(); }catch(e){ alert(e.message); }};
  const badge=(d)=> d==='APPROVE'?'approve':d==='REJECT'?'reject':'escalate';

  return <div className="container">
    <style>{styles}</style>
    <div className="topbar"><div><h1>Two-Brain Wallet <span style={{fontSize:14,color:'#9fafc9'}}>React v3</span></h1><p className="sub">Ethos-inspired dark theme · React frontend · Solana Devnet</p></div><div className="pill">DEVNET</div></div>
    <div className="stats">
      <div className="card stat"><div className="k">Wallet</div><div className="v mono">{wallet?.publicKey ? `${wallet.publicKey.slice(0,6)}...${wallet.publicKey.slice(-6)}` : '-'}</div></div>
      <div className="card stat"><div className="k">SOL Balance</div><div className="v">{wallet?.sol ?? '-'}</div></div>
      <div className="card stat"><div className="k">Agent Loop</div><div className="v"><span className={`dot ${status.running?'live':''}`}></span>{status.running?'running':'idle'}</div></div>
      <div className="card stat"><div className="k">Last Run</div><div className="v">{status.lastRunAt ? new Date(status.lastRunAt).toLocaleTimeString() : '-'}</div></div>
    </div>
    <div className="layout">
      <div>
        <div className="card">
          <h3 className="section-title">Wallet & dApp Proof</h3>
          <div className="row">
            <button className="primary" onClick={()=>action('/wallet/create',{})}>Create Wallet</button>
            <button onClick={refreshWallet}>Refresh Wallet</button>
            <button className="good" onClick={()=>action('/dapp/memo',{memo:`ui-proof-${Date.now()}`})}>Send Memo Proof</button>
          </div>
          <p className="muted mt">{wallet?.error ? wallet.error : wallet ? `Address: ${wallet.publicKey}\nSOL: ${wallet.sol}\nRPC: ${wallet.rpcUrl}` : 'Loading...'}</p>
        </div>
        <div className="card mt">
          <h3 className="section-title">Manual Command</h3>
          <p className="muted">Use format: <code>SWAP 0.1 SOL TO USDC SLIPPAGE 30</code></p>
          <div className="row">
            <input style={{flex:1}} value={cmd} onChange={e=>setCmd(e.target.value)} />
            <button className="primary" onClick={()=>action('/command',{text:cmd})}>Run Debate</button>
            <button onClick={refreshEvents}>Refresh</button>
          </div>
        </div>
        <div className="card mt">
          <h3 className="section-title">Autonomous Agent Loop</h3>
          <div className="row">
            <input style={{flex:1}} value={agentCmd} onChange={e=>setAgentCmd(e.target.value)} />
            <input style={{width:100}} type="number" min="10" value={intervalSec} onChange={e=>setIntervalSec(Number(e.target.value))} />
          </div>
          <div className="row mt">
            <button className="good" onClick={()=>action('/agent/start',{command:agentCmd,intervalSec})}>Start</button>
            <button className="warn" onClick={()=>action('/agent/tick',{command:agentCmd})}>Run Tick</button>
            <button className="danger" onClick={()=>action('/agent/stop',{})}>Stop</button>
          </div>
          <p className="muted mt">running={String(status.running)} intervalSec={status.intervalSec} command="{status.command}"</p>
        </div>
      </div>
      <div>
        <div className="card timeline">
          <h3 className="section-title">Debate Timeline</h3>
          {events.map(d => <div key={d.id} className="entry">
            <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}><div><strong>{d.intent.inputSymbol}→{d.intent.outputSymbol}</strong> <span className="muted">{d.intent.amount} {d.intent.amountUnit}</span></div><span className={`badge ${badge(d.decision)}`}>{d.decision}</span></div>
            <div className="muted">{new Date(d.createdAt).toLocaleString()}</div>
            <div className="muted mt">{d.alphaReasoning}</div>
            <div className="muted">{d.guardReasoning}</div>
            <div className="muted mono mt">TX: {d.executionTx || '-'}</div>
            <div className="row mt">
              <button onClick={()=>action('/override',{debateId:d.id,approved:true})}>Override Approve</button>
              <button onClick={()=>action('/override',{debateId:d.id,approved:false})}>Override Reject</button>
              <button className="primary" onClick={()=>action('/execute',{debateId:d.id})}>Execute</button>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}

createRoot(document.getElementById("app")).render(<App />);
