import React from 'react';

const steps = [
    {
        number: '01',
        title: 'ALPHA',
        color: 'green',
        icon: 'α',
        desc: 'The Alpha agent proposes a trading strategy. It scans DeFi opportunities, builds intent payloads, and structures the swap parameters including token pair, amount, and slippage tolerance.',
    },
    {
        number: '02',
        title: 'DEBATE',
        color: 'orange',
        icon: '⚡',
        desc: 'Both agents enter a structured debate. Alpha presents its reasoning while Guard cross-examines against configurable policy rules — checking risk thresholds, position limits, and safety constraints.',
    },
    {
        number: '03',
        title: 'GUARD',
        color: 'red',
        icon: 'G',
        desc: 'The Guard agent renders a final verdict: APPROVE for execution, REJECT to block the trade, or ESCALATE for human review. Only approved intents proceed to the Solana transaction pipeline.',
    },
];

export default function HowItWorks() {
    return (
        <section className="how-section" id="how">
            <div className="section" style={{ paddingBottom: 40 }}>
                <div className="section-header">
                    <div className="section-label">Architecture</div>
                    <h2 className="section-title">
                        How every
                        <br />
                        trade is
                        <br />
                        evaluated
                    </h2>
                    <p className="section-subtitle">
                        A dual-agent system where every wallet action passes through structured debate
                        before touching the blockchain.
                    </p>
                </div>
            </div>

            <div className="section" style={{ paddingTop: 0 }}>
                <div className="how-connector">
                    <div className="how-connector-line" />
                </div>

                <div className="how-grid">
                    {steps.map((s) => (
                        <div className="how-card" key={s.number}>
                            <div className={`how-card-icon ${s.color}`}>{s.icon}</div>
                            <div className="how-card-number">{s.number}</div>
                            <div className={`how-card-title ${s.color}`}>{s.title}</div>
                            <p className="how-card-desc">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
