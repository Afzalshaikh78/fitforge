import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/ui/animated-hero';

const FEATURES = [
  { icon: '🔥', title: 'Calorie Tracker', desc: 'Log every meal, track macros in real-time, and hit your daily goals with precision.' },
  { icon: '💪', title: 'Workout Library', desc: 'Access 100+ workouts or build custom programs tailored to your fitness level.' },
  { icon: '🥗', title: 'Meal Plans', desc: 'Science-backed nutrition plans for cutting, bulking, or maintaining your physique.' },
  { icon: '📊', title: 'Progress Analytics', desc: 'Visualize your gains with detailed charts, body composition tracking, and trends.' },
  { icon: '⚡', title: 'AI Recommendations', desc: 'Get personalized workout and diet advice based on your goals and history.' },
  { icon: '🏆', title: 'Achievement System', desc: 'Stay motivated with milestones, streaks, and badges for every fitness goal.' },
];

const PLANS = [
  {
    name: 'FREE', price: '$0', period: 'forever',
    features: ['Calorie tracking', 'Pre-built workouts', 'Basic meal plans', 'Progress charts', '3 workout logs/week'],
    cta: 'Get Started Free', highlight: false
  },
  {
    name: 'PRO', price: '$12', period: 'per month',
    features: ['Everything in Free', 'Custom workout builder', 'Custom meal plans', 'Advanced analytics', 'Unlimited logging', 'Priority support', 'AI recommendations'],
    cta: 'Start Pro Trial', highlight: true
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.05em' }}>FITFORGE</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Start Free</Link>
        </div>
      </nav>

      {/* ── Animated Hero Section ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
        position: 'relative',
        background: 'var(--bg)',
      }}>
        {/* Radial accent glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,255,69,0.05) 0%, transparent 60%)',
        }} />
        <Hero />
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '0.02em', marginBottom: 16 }}>EVERYTHING YOU NEED</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>One platform, infinite gains. Stop juggling apps and start making progress.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div key={title} className="card"
              style={{ animationDelay: `${i * 0.1}s`, transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,255,69,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '0.02em', marginBottom: 16 }}>SIMPLE PRICING</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>No tricks. No hidden fees. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {PLANS.map(({ name, price, period, features, cta, highlight }) => (
              <div key={name} className="card" style={{
                position: 'relative',
                border: highlight ? '1px solid rgba(232,255,69,0.4)' : '1px solid var(--border)',
                background: highlight ? 'rgba(232,255,69,0.03)' : 'var(--bg-card)',
              }}>
                {highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, letterSpacing: '0.1em' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.05em', color: highlight ? 'var(--accent)' : 'var(--text)' }}>{name}</div>
                <div style={{ marginTop: 8, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: '-0.02em' }}>{price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 4 }}>{period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, fontSize: 14, color: 'var(--text-dim)' }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${highlight ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', justifyContent: 'center' }}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '100px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 80px)', letterSpacing: '0.01em', marginBottom: 24 }}>
          READY TO<br /><span style={{ color: 'var(--accent)' }}>TRANSFORM?</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40 }}>Join 50,000+ athletes already using FitForge</p>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: '20px 48px' }}>
          Start Your Journey →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.05em' }}>FITFORGE</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 FitForge. Built for athletes.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
