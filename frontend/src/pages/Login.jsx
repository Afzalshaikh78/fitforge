import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../lib/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) return setError('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID');
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'token id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.05em' }}>FITFORGE</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.02em', marginBottom: 8 }}>WELCOME BACK</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to continue your journey</p>
        </div>

        <div className="card">
          {error && <div style={{ padding: '12px 16px', background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.3)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>{error}</div>}

          <button onClick={handleGoogle} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
