'use client';

import { useState } from 'react';
import { useDemoEmail } from '@/lib/useDemoEmail.js';
import DemoEmailField from '@/components/DemoEmailField.js';

const COINS = [
    ['bitcoin', 'Bitcoin'],
    ['ethereum', 'Ethereum'],
    ['solana', 'Solana'],
    ['dogecoin', 'Dogecoin'],
    ['cardano', 'Cardano'],
    ['ripple', 'XRP'],
];

const ACTOR_URL = 'https://apify.com/m_ctim/crypto-price-tracker';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 });
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, signDisplay: 'always' });

export default function CryptoPriceForm() {
    const [selected, setSelected] = useState({ bitcoin: true, ethereum: true, solana: false, dogecoin: false, cardano: false, ripple: false });
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [capped, setCapped] = useState(false);
    const [pending, setPending] = useState(false);
    const [email, setEmail] = useDemoEmail();

    function toggleCoin(coinId) {
        setSelected((prev) => ({ ...prev, [coinId]: !prev[coinId] }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setCapped(false);
        setResults(null);

        const coinIds = COINS.map(([id]) => id).filter((id) => selected[id]);

        try {
            const res = await fetch('/api/demo/crypto-price-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coinIds, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                setCapped(res.status === 429);
            } else {
                setResults(data.results);
            }
        } catch {
            setError('Could not reach the demo. Try again in a moment.');
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="demo-panel">
            <form onSubmit={handleSubmit} className="demo-form">
                <div className="form-field">
                    <label>Coins</label>
                    <div className="demo-form-grid">
                        {COINS.map(([id, label]) => (
                            <label key={id} className="form-checkbox">
                                <input type="checkbox" checked={!!selected[id]} onChange={() => toggleCoin(id)} />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <DemoEmailField value={email} onChange={setEmail} />

                <button className="btn" type="submit" disabled={pending}>
                    {pending ? 'Checking…' : 'Check prices'}
                </button>
                <p className="demo-note">Shared demo, capped per day. Prices in USD.</p>
            </form>

            {error && <p className="form-error">{error}</p>}

            {capped && (
                <div className="demo-cta">
                    <p className="demo-cta__title">Free demo runs used up for today</p>
                    <p className="demo-cta__body">
                        Run crypto-price-tracker on Apify with your own account for unlimited
                        checks, saved schedules, and any currency.
                    </p>
                    <div className="demo-cta__actions">
                        <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                            Run it on Apify
                        </a>
                    </div>
                </div>
            )}

            {results && results.length > 0 && (
                <>
                    <div className="demo-results">
                        <table className="demo-table">
                            <thead>
                                <tr>
                                    <th>Coin</th>
                                    <th>Price</th>
                                    <th>24h</th>
                                    <th>7d</th>
                                    <th>Market cap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((coin) => (
                                    <tr key={coin.coinId}>
                                        <td>
                                            {coin.name} <span className="mono">{coin.symbol?.toUpperCase()}</span>
                                        </td>
                                        <td className="mono">{coin.currentPrice != null ? currencyFormatter.format(coin.currentPrice) : '—'}</td>
                                        <td className="mono">
                                            {coin.priceChangePercentage24h != null ? `${percentFormatter.format(coin.priceChangePercentage24h)}%` : '—'}
                                        </td>
                                        <td className="mono">
                                            {coin.priceChangePercentage7d != null ? `${percentFormatter.format(coin.priceChangePercentage7d)}%` : '—'}
                                        </td>
                                        <td className="mono">{coin.marketCap != null ? currencyFormatter.format(coin.marketCap) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="demo-cta">
                        <p className="demo-cta__title">That's live data</p>
                        <p className="demo-cta__body">
                            Run this on your own schedule, with any CoinGecko coin and any quote
                            currency, directly on Apify.
                        </p>
                        <div className="demo-cta__actions">
                            <a className="btn" href={ACTOR_URL} target="_blank" rel="noopener noreferrer">
                                Run it on Apify
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
