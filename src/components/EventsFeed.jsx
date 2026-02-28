import React from 'react';

export default function EventsFeed({ events }) {
    return (
        <section className="events-section" id="events">
            <div className="section">
                <div className="section-header">
                    <div className="section-label">Live Feed</div>
                    <h2 className="section-title">
                        Agent
                        <br />
                        Events
                    </h2>
                    <p className="section-subtitle">
                        Real-time timeline of autonomous agent debates, decisions, and
                        on-chain executions.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="events-empty">
                        <div className="events-empty-icon">◎</div>
                        <div className="events-empty-text">
                            No events yet. Start the agent to see live debates here.
                        </div>
                    </div>
                ) : (
                    <div className="events-list">
                        {events.map((d, i) => (
                            <div
                                className="event-card"
                                key={d.id}
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                <div className="event-header">
                                    <div className="event-trade">
                                        <span>{d.intent?.inputSymbol ?? '?'}</span>
                                        <span className="event-arrow">→</span>
                                        <span>{d.intent?.outputSymbol ?? '?'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {d.intent?.amount} {d.intent?.amountUnit}
                                        </span>
                                    </div>
                                    <span
                                        className={`event-badge ${(d.decision || '').toLowerCase()}`}
                                    >
                                        {d.decision}
                                    </span>
                                </div>

                                {d.guardReasoning && (
                                    <div className="event-reasoning">{d.guardReasoning}</div>
                                )}

                                <div className="event-meta">
                                    <span>{new Date(d.createdAt).toLocaleString()}</span>
                                    <span className="event-tx">
                                        tx: {d.executionTx || '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
