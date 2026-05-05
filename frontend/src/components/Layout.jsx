import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/calories', label: 'Calories', icon: '🔥' },
  { path: '/workouts', label: 'Workouts', icon: '💪' },
  { path: '/meal-plans', label: 'Meal Plans', icon: '🥗' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16 }}>⚡</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.05em', color: 'var(--text)' }}>FITFORGE</span>
          </Link>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>👤</span>}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <span className="badge" style={{ marginTop: 2 }} {...(user?.plan === 'pro' ? { className: 'badge badge-pro' } : { className: 'badge badge-free' })}>
              {user?.plan === 'pro' ? '⚡ PRO' : 'FREE'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, marginBottom: 2, fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : 'var(--text-dim)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
                {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, background: 'var(--accent)', borderRadius: '50%' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
          {user?.plan === 'free' && (
            <Link to="/pricing" style={{
              display: 'block', padding: '12px', borderRadius: 8, marginBottom: 8,
              background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.2)',
              textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
              letterSpacing: '0.05em'
            }}>
              ⚡ UPGRADE TO PRO
            </Link>
          )}
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
