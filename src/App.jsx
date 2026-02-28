import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Dashboard from './components/Dashboard';
import EventsFeed from './components/EventsFeed';
import Footer from './components/Footer';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function apiFetch(url, opts = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'content-type': 'application/json', ...(opts.headers || {}) },
        ...opts,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'request failed');
    return data;
}

export default function App() {
    const [wallet, setWallet] = useState(null);
    const [status, setStatus] = useState({
        running: false,
        intervalSec: 60,
        command: 'SWAP 0.05 SOL TO USDC SLIPPAGE 30',
    });
    const [events, setEvents] = useState([]);
    const [activeSection, setActiveSection] = useState('hero');

    const refresh = useCallback(async () => {
        try {
            const [w, s, e] = await Promise.all([
                apiFetch('/wallet'),
                apiFetch('/agent/status'),
                apiFetch('/events'),
            ]);
            setWallet(w);
            setStatus(s);
            setEvents(e.debates || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        refresh();
        const t = setInterval(refresh, 8000);
        return () => clearInterval(t);
    }, [refresh]);

    const navigate = (id) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const createWallet = () =>
        apiFetch('/wallet/create', { method: 'POST', body: '{}' })
            .then(refresh)
            .catch((e) => alert(e.message));

    const sendProof = () =>
        apiFetch('/dapp/memo', {
            method: 'POST',
            body: JSON.stringify({ memo: `agent-proof-${Date.now()}` }),
        })
            .then(refresh)
            .catch((e) => alert(e.message));

    const startLoop = () =>
        apiFetch('/agent/start', {
            method: 'POST',
            body: JSON.stringify({
                command: status.command,
                intervalSec: status.intervalSec || 60,
            }),
        })
            .then(refresh)
            .catch((e) => alert(e.message));

    const runTick = () =>
        apiFetch('/agent/tick', {
            method: 'POST',
            body: JSON.stringify({ command: status.command }),
        })
            .then(refresh)
            .catch((e) => alert(e.message));

    const stopLoop = () =>
        apiFetch('/agent/stop', { method: 'POST', body: '{}' })
            .then(refresh)
            .catch((e) => alert(e.message));

    return (
        <>
            <Navbar onNavigate={navigate} activeSection={activeSection} />
            <Hero onNavigate={navigate} wallet={wallet} />
            <HowItWorks />
            <Dashboard
                wallet={wallet}
                status={status}
                onStatusChange={setStatus}
                onCreateWallet={createWallet}
                onSendProof={sendProof}
                onRefresh={refresh}
                onStartLoop={startLoop}
                onRunTick={runTick}
                onStopLoop={stopLoop}
            />
            <EventsFeed events={events} />
            <Footer />
        </>
    );
}
