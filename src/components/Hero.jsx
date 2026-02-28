import React, { useEffect, useState } from 'react';

function AnimatedNumber({ target, duration = 2000 }) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setValue(target);
                clearInterval(timer);
            } else {
                setValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);

    return <>{value.toLocaleString()}</>;
}

export default function Hero({ onNavigate, wallet }) {
    const solBalance = wallet?.sol != null ? parseFloat(wallet.sol) : 0;

    return (
        <section className="hero" id="hero">
            <div className="hero-bg" />
            <div className="hero-grid-overlay" />

            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-headline">
                        Agentic
                        <br />
                        Wallet,
                        <br />
                        <span className="accent">Onchain</span>
                    </h1>
                    <p className="hero-subtitle">
                        Two AI agents — Alpha and Guard — debate every trade before execution.
                        Built on Solana for autonomous, policy-driven DeFi with human oversight.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
                            {'>'} Open Dashboard
                        </button>
                        <button className="btn" onClick={() => onNavigate('how')}>
                            {'>'} How It Works
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="orbit-container">
                        <div className="orbit-ring" />
                        <div className="orbit-ring" />
                        <div className="orbit-ring" />

                        <div className="orbit-center">
                            <span className="orbit-center-label">
                                TWO
                                <br />
                                BRAIN
                            </span>
                        </div>

                        <div className="orbit-node alpha">α</div>
                        <div className="orbit-node guard">G</div>
                        <div className="orbit-node exec">TX</div>
                    </div>
                </div>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-label">Network</div>
                    <div className="stat-value">Solana<span className="unit">devnet</span></div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Balance</div>
                    <div className="stat-value">
                        <AnimatedNumber target={solBalance} />
                        <span className="unit">SOL</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Agents</div>
                    <div className="stat-value">
                        <AnimatedNumber target={2} />
                        <span className="unit">active</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Policy</div>
                    <div className="stat-value">Guard<span className="unit">enforced</span></div>
                </div>
            </div>
        </section>
    );
}
