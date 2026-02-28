import React from 'react';

export default function Dashboard({
    wallet,
    status,
    onStatusChange,
    onCreateWallet,
    onSendProof,
    onRefresh,
    onStartLoop,
    onRunTick,
    onStopLoop,
}) {
    return (
        <section className="dashboard-section" id="dashboard">
            <div className="section">
                <div className="section-header">
                    <div className="section-label">Control Center</div>
                    <h2 className="section-title">
                        Agent
                        <br />
                        Dashboard
                    </h2>
                </div>

                <div className="dashboard-grid">
                    {/* Wallet Panel */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <span className="panel-title">Wallet</span>
                            <div className="panel-status">
                                <span
                                    className={`status-dot ${wallet?.publicKey ? 'live' : ''}`}
                                />
                                {wallet?.publicKey ? 'connected' : 'offline'}
                            </div>
                        </div>

                        <div className="panel-value address">
                            {wallet?.publicKey || 'No wallet initialized'}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 24,
                                marginTop: 16,
                                marginBottom: 20,
                            }}
                        >
                            <div>
                                <div className="panel-title" style={{ marginBottom: 4 }}>
                                    SOL Balance
                                </div>
                                <div className="panel-value">{wallet?.sol ?? '—'}</div>
                            </div>
                            <div>
                                <div className="panel-title" style={{ marginBottom: 4 }}>
                                    SPL Tokens
                                </div>
                                <div className="panel-value">
                                    {wallet?.splTokens?.length ?? 0}
                                </div>
                            </div>
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-green" onClick={onCreateWallet}>
                                {'>'} Create Wallet
                            </button>
                            <button className="btn btn-primary" onClick={onSendProof}>
                                {'>'} Send Proof TX
                            </button>
                            <button className="btn" onClick={onRefresh}>
                                {'>'} Refresh
                            </button>
                        </div>
                    </div>

                    {/* Agent Controls Panel */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <span className="panel-title">Autonomous Agent</span>
                            <div className="panel-status">
                                <span
                                    className={`status-dot ${status.running ? 'live' : ''}`}
                                />
                                {status.running ? 'running' : 'idle'}
                            </div>
                        </div>

                        <div className="input-group">
                            <input
                                className="input-field"
                                placeholder="SWAP 0.1 SOL TO USDC SLIPPAGE 30"
                                value={status.command || ''}
                                onChange={(e) =>
                                    onStatusChange({ ...status, command: e.target.value })
                                }
                            />
                            <input
                                className="input-field small"
                                type="number"
                                min="10"
                                placeholder="60"
                                value={status.intervalSec || 60}
                                onChange={(e) =>
                                    onStatusChange({
                                        ...status,
                                        intervalSec: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-green" onClick={onStartLoop}>
                                {'>'} Start
                            </button>
                            <button className="btn btn-orange" onClick={onRunTick}>
                                {'>'} Run Tick
                            </button>
                            <button className="btn btn-red" onClick={onStopLoop}>
                                {'>'} Stop
                            </button>
                        </div>

                        <div className="panel-meta">
                            Last run: {status.lastRunAt || '—'}
                            {status.lastError && (
                                <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>
                                    | error: {status.lastError}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Network Info Panel */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <span className="panel-title">Network</span>
                        </div>
                        <div className="panel-value">Solana</div>
                        <div className="panel-label">Devnet RPC</div>
                        <div
                            className="panel-meta"
                            style={{ marginTop: 12 }}
                        >
                            https://api.devnet.solana.com
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                            <div>
                                <div className="panel-title" style={{ marginBottom: 4 }}>
                                    Mode
                                </div>
                                <div
                                    className="panel-value"
                                    style={{ color: 'var(--accent-orange)', fontSize: 16 }}
                                >
                                    DRY RUN
                                </div>
                            </div>
                            <div>
                                <div className="panel-title" style={{ marginBottom: 4 }}>
                                    Stack
                                </div>
                                <div
                                    className="panel-value"
                                    style={{ fontSize: 16 }}
                                >
                                    React + Vite
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <span className="panel-title">API Endpoints</span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                            }}
                        >
                            {[
                                'POST /wallet/create',
                                'GET  /wallet',
                                'POST /dapp/memo',
                                'POST /command',
                                'POST /debate',
                                'POST /execute',
                                'GET  /events',
                                'POST /agent/start',
                                'POST /agent/stop',
                            ].map((ep) => (
                                <div
                                    key={ep}
                                    style={{
                                        padding: '8px 12px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    {ep}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
