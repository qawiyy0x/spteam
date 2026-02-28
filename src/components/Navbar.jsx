import React from 'react';

export default function Navbar({ onNavigate, activeSection }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <div className="navbar-logo-inner" />
        </div>
        <span className="navbar-title">Two-Brain Wallet</span>
      </div>

      <ul className="navbar-nav">
        {['how', 'dashboard', 'events'].map((id) => (
          <li key={id}>
            <button
              className={`navbar-link ${activeSection === id ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              {id === 'how' ? 'How It Works' : id === 'dashboard' ? 'Dashboard' : 'Events'}
            </button>
          </li>
        ))}
        <li>
          <a
            href="https://github.com/qawiyy0x/spteam"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link"
          >
            GitHub
          </a>
        </li>
        <li><span className="navbar-badge">DEVNET</span></li>
      </ul>

      <button className="navbar-cta" onClick={() => onNavigate('dashboard')}>
        {'> Launch App'}
      </button>
    </nav>
  );
}
