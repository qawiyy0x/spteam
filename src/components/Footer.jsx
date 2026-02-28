import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-brand-name">Two-Brain Wallet</div>
                    <p className="footer-brand-desc">
                        Dual-agent agentic wallet on Solana. Every trade passes through a
                        structured Alpha vs Guard debate before touching the chain.
                    </p>
                </div>

                <div>
                    <div className="footer-section-title">Protocol</div>
                    <ul className="footer-links">
                        <li>
                            <a
                                href="https://github.com/qawiyy0x/spteam"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/qawiyy0x/spteam/blob/main/docs/DEEP_DIVE.md"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Deep Dive
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/qawiyy0x/spteam/blob/main/SKILLS.md"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Agent Skills
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="footer-section-title">Network</div>
                    <ul className="footer-links">
                        <li>
                            <a
                                href="https://solana.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Solana
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://explorer.solana.com/?cluster=devnet"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Explorer
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://jup.ag"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Jupiter
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="footer-section-title">Stack</div>
                    <ul className="footer-links">
                        <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a></li>
                        <li><a href="https://vite.dev" target="_blank" rel="noopener noreferrer">Vite</a></li>
                        <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <span className="footer-copy">
                    © {new Date().getFullYear()} Two-Brain Wallet — Built for Solana
                    Hackathon
                </span>
                <div className="footer-badges">
                    <span className="footer-badge">DEVNET</span>
                    <span className="footer-badge">ALPHA</span>
                    <span className="footer-badge">v0.1.0</span>
                </div>
            </div>
        </footer>
    );
}
