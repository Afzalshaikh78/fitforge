import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const GOALS = [
  { value: 'lose_weight', label: '🔥 Lose Weight', desc: 'Caloric deficit, cardio focus' },
  { value: 'build_muscle', label: '💪 Build Muscle', desc: 'Caloric surplus, strength training' },
  { value: 'maintain', label: '⚖️ Maintain', desc: 'Balanced nutrition & fitness' },
  { value: 'endurance', label: '🏃 Endurance', desc: 'Cardio & stamina focus' },
];

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    height: user?.height || '',
    weight: user?.weight || '',
    age: user?.age || '',
    goal: user?.goal || 'maintain',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
  });
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    api.get('/weight').then(r => setWeightLogs(r.data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.post('/weight', { weight: newWeight, date: today });
    setWeightLogs(prev => [...prev, data]);
    setNewWeight('');
    // also update profile weight
    await api.put('/auth/profile', { ...form, weight: newWeight });
    refreshUser();
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const { data } = await api.post('/stripe/portal');
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Could not open billing portal');
    } finally { setBillingLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const chartData = weightLogs.slice(-30).map(l => ({
    date: l.date.slice(5),
    weight: parseFloat(l.weight),
  }));

  const bmi = form.height && form.weight
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: 'var(--blue)' }
      : bmi < 25 ? { label: 'Normal', color: 'var(--green)' }
      : bmi < 30 ? { label: 'Overweight', color: 'var(--orange)' }
      : { label: 'Obese', color: 'var(--red)' }
    : null;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title" style={{ fontSize: 36 }}>PROFILE</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your account and fitness settings</p>
      </div>

      {/* User Card */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid rgba(232,255,69,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {user?.avatar
            ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.name} />
            : <span style={{ fontSize: 28 }}>👤</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.02em' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${user?.plan === 'pro' ? 'badge-pro' : 'badge-free'}`}>
              {user?.plan === 'pro' ? '⚡ PRO' : 'FREE PLAN'}
            </span>
            {user?.subscriptionStatus && user.plan === 'pro' && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                Status: {user.subscriptionStatus}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {user?.plan === 'free'
            ? <Link to="/pricing" className="btn btn-primary btn-sm">⚡ Upgrade to Pro</Link>
            : <button onClick={handleManageBilling} className="btn btn-outline btn-sm" disabled={billingLoading}>
                {billingLoading ? '...' : 'Manage Billing'}
              </button>
          }
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
        {['profile', 'weight', 'billing'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            textTransform: 'capitalize', transition: 'all 0.15s',
            background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? '#000' : 'var(--text-muted)',
          }}>{t}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.03em', marginBottom: 24 }}>FITNESS PROFILE</h2>
            {saved && (
              <div style={{ padding: '12px 16px', background: 'rgba(69,255,138,0.1)', border: '1px solid rgba(69,255,138,0.3)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ✓ Profile saved successfully
              </div>
            )}
            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.3)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--red)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="25" min="10" max="100" />
                </div>
                <div>
                  <label className="label">Daily Calorie Goal</label>
                  <input className="input" type="number" value={form.dailyCalorieGoal} onChange={e => setForm({...form, dailyCalorieGoal: e.target.value})} placeholder="2000" min="500" max="10000" />
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input className="input" type="number" value={form.height} onChange={e => setForm({...form, height: e.target.value})} placeholder="175" min="100" max="250" />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input className="input" type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="75" step="0.1" min="20" max="500" />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Fitness Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {GOALS.map(g => (
                    <button key={g.value} type="button" onClick={() => setForm({...form, goal: g.value})} style={{
                      padding: '12px 14px', borderRadius: 8, border: `1px solid ${form.goal === g.value ? 'rgba(232,255,69,0.5)' : 'var(--border)'}`,
                      background: form.goal === g.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                      textAlign: 'left', transition: 'all 0.15s', cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.goal === g.value ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* BMI / Stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200 }}>
            {bmi && (
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>BMI</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: bmiCategory.color, marginBottom: 4 }}>{bmi}</div>
                <div style={{ fontSize: 12, color: bmiCategory.color, fontWeight: 700 }}>{bmiCategory.label}</div>
              </div>
            )}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>QUICK STATS</div>
              {[
                { label: 'Current Weight', value: form.weight ? `${form.weight} kg` : '—' },
                { label: 'Height', value: form.height ? `${form.height} cm` : '—' },
                { label: 'Calorie Goal', value: `${form.dailyCalorieGoal} kcal` },
                { label: 'Goal', value: GOALS.find(g => g.value === form.goal)?.label || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weight Tab */}
      {tab === 'weight' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, marginBottom: 24 }}>
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.03em', marginBottom: 20 }}>WEIGHT HISTORY</h2>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                      formatter={v => [`${v} kg`, 'Weight']}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#e8ff45" strokeWidth={2} dot={{ fill: '#e8ff45', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: 32 }}>📉</span>
                  <span style={{ fontSize: 14 }}>Log at least 2 weights to see your trend</span>
                </div>
              )}
            </div>

            <div style={{ minWidth: 220 }}>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>LOG WEIGHT</h3>
                <form onSubmit={handleLogWeight}>
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Weight (kg)</label>
                    <input className="input" type="number" step="0.1" placeholder="75.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Log Today
                  </button>
                </form>
              </div>

              {weightLogs.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>STATS</div>
                  {(() => {
                    const weights = weightLogs.map(l => parseFloat(l.weight));
                    const latest = weights[weights.length - 1];
                    const first = weights[0];
                    const change = latest - first;
                    return [
                      { label: 'Latest', value: `${latest} kg` },
                      { label: 'Starting', value: `${first} kg` },
                      { label: 'Change', value: `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`, color: change < 0 ? 'var(--green)' : change > 0 ? 'var(--red)' : 'var(--text)' },
                      { label: 'Entries', value: weightLogs.length },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Recent logs table */}
          {weightLogs.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>RECENT ENTRIES</h3>
              {weightLogs.slice().reverse().slice(0, 10).map((log, i) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{log.date}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>{parseFloat(log.weight)} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Billing Tab */}
      {tab === 'billing' && (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.03em', marginBottom: 20 }}>SUBSCRIPTION</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Current Plan</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.plan === 'pro' ? 'FitForge Pro — $12/month' : 'FitForge Free'}</div>
              </div>
              <span className={`badge ${user?.plan === 'pro' ? 'badge-pro' : 'badge-free'}`}>
                {user?.plan === 'pro' ? '⚡ PRO' : 'FREE'}
              </span>
            </div>
            {user?.subscriptionStatus && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700 }}>Status</div>
                <div style={{ fontSize: 13, color: user?.subscriptionStatus === 'active' ? 'var(--green)' : 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>
                  {user?.subscriptionStatus}
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              {user?.plan === 'free' ? (
                <Link to="/pricing" className="btn btn-primary">⚡ Upgrade to Pro</Link>
              ) : (
                <button onClick={handleManageBilling} className="btn btn-outline" disabled={billingLoading}>
                  {billingLoading ? 'Loading...' : 'Manage Subscription & Billing'}
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.03em', marginBottom: 16 }}>PLAN COMPARISON</h3>
            {[
              { feature: 'Calorie Tracking', free: true, pro: true },
              { feature: 'Pre-built Workouts', free: true, pro: true },
              { feature: 'Pre-built Meal Plans', free: true, pro: true },
              { feature: 'Weight Logging', free: true, pro: true },
              { feature: 'Progress Charts', free: true, pro: true },
              { feature: 'Custom Workouts', free: false, pro: true },
              { feature: 'Custom Meal Plans', free: false, pro: true },
              { feature: 'Advanced Analytics', free: false, pro: true },
              { feature: 'Unlimited Logging', free: false, pro: true },
              { feature: 'AI Recommendations', free: false, pro: true },
            ].map(({ feature, free, pro }) => (
              <div key={feature} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-dim)' }}>{feature}</span>
                <span style={{ textAlign: 'center', color: free ? 'var(--green)' : 'var(--text-muted)' }}>{free ? '✓' : '—'}</span>
                <span style={{ textAlign: 'center', color: pro ? 'var(--accent)' : 'var(--text-muted)' }}>{pro ? '⚡' : '—'}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="card" style={{ marginTop: 20, border: '1px solid rgba(255,69,69,0.2)' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 12, fontSize: 14 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Sign out from all sessions or delete your account. Deletion is permanent.
            </p>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}
