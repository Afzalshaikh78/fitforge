import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../lib/api.js';

const FEATURES = {
  free: [
    'Calorie tracking (unlimited)',
    'Macro breakdown (protein, carbs, fat)',
    'Pre-built workout library (4 workouts)',
    'Pre-built meal plans (3 plans)',
    'Basic progress charts',
    'Weight logging',
    'Daily calorie goal setting',
  ],
  pro: [
    'Everything in Free',
    'Custom workout builder',
    'Custom meal plan creator',
    'Advanced analytics & trends',
    'Unlimited workout logging',
    'AI-powered recommendations',
    'Priority support',
    'Early access to new features',
  ],
};

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    if (!user) { navigate('/register'); return; }
    if (user.plan === 'pro') { navigate('/dashboard'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/stripe/create-checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start checkout. Please configure Stripe keys.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/stripe/portal');
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to open billing portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 24px' }}>
      {/* Nav */}
      <nav style={{ padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', maxWidth: 1100, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.05em' }}>FITFORGE</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 0 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 24 }}>
            TRANSPARENT PRICING
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.01em', marginBottom: 16, lineHeight: 0.95 }}>
            INVEST IN<br /><span style={{ color: 'var(--accent)' }}>YOUR GAINS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 440, margin: '0 auto' }}>
            Start free, upgrade when you're ready. No contracts, cancel anytime.
          </p>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.3)', borderRadius: 'var(--radius)', marginBottom: 32, fontSize: 13, color: 'var(--red)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 60 }}>
          {/* Free */}
          <div className="card">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>FREE</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: '-0.02em', lineHeight: 1 }}>$0</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/ forever</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Everything you need to start your fitness journey — no credit card required.
              </p>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: 28 }}>
              {FEATURES.free.map(f => (
                <li key={f} style={{ display: 'flex', gap: 10, padding: '7px 0', fontSize: 13, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {user?.plan === 'free' ? (
              <div className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', cursor: 'default', opacity: 0.6 }}>
                Current Plan
              </div>
            ) : !user ? (
              <Link to="/register" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Get Started Free
              </Link>
            ) : null}
          </div>

          {/* Pro */}
          <div className="card" style={{ position: 'relative', border: '1px solid rgba(232,255,69,0.4)', background: 'linear-gradient(160deg, rgba(232,255,69,0.04) 0%, rgba(10,10,10,0) 50%)' }}>
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 800, padding: '5px 14px', borderRadius: 100, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              ⚡ MOST POPULAR
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 12 }}>PRO</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: '-0.02em', lineHeight: 1 }}>$12</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/ month</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Unlock the full FitForge experience and accelerate your results.
              </p>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: 28 }}>
              {FEATURES.pro.map((f, i) => (
                <li key={f} style={{ display: 'flex', gap: 10, padding: '7px 0', fontSize: 13, color: i === 0 ? 'var(--text-muted)' : 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {user?.plan === 'pro' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                  ⚡ Pro Active
                </div>
                <button onClick={handlePortal} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  Manage Billing
                </button>
              </div>
            ) : (
              <button onClick={handleUpgrade} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Redirecting...' : user ? 'Upgrade to Pro →' : 'Start Pro Trial →'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.02em', textAlign: 'center', marginBottom: 32 }}>COMMON QUESTIONS</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your billing portal. You keep Pro access until the end of the billing period.' },
            { q: 'What payment methods are accepted?', a: 'All major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Your payment info is never stored on our servers.' },
            { q: 'What happens to my data if I downgrade?', a: 'Your custom workouts and meal plans remain saved. You just lose the ability to create new ones until you re-upgrade.' },
            { q: 'Is there a free trial for Pro?', a: 'The free plan lets you explore core features indefinitely. We may offer timed Pro trials — check back for promotions.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{q}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{a}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Still have questions? We're here to help.
          </p>
          <a href="mailto:support@fitforge.app" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
            support@fitforge.app
          </a>
        </div>
      </div>
    </div>
  );
}
