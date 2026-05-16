import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../lib/api.js';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const today = () => new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [calories, setCalories] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  useEffect(() => {
    let refreshInterval;
    let refreshTimeout;

    if (searchParams.get('upgraded') === 'true') {
      refreshUser();
      setShowUpgradeBanner(true);
      setTimeout(() => setShowUpgradeBanner(false), 5000);

      refreshInterval = setInterval(() => {
        refreshUser();
      }, 3000);

      refreshTimeout = setTimeout(() => {
        clearInterval(refreshInterval);
      }, 30000);
    }

    fetchData();
    return () => {
      clearInterval(refreshInterval);
      clearTimeout(refreshTimeout);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true' && user?.plan === 'pro') {
      setShowUpgradeBanner(true);
    }
  }, [searchParams, user?.plan]);

  const fetchData = async () => {
    try {
      const [cal, wl, wt] = await Promise.all([
        api.get(`/calories?date=${today()}`),
        api.get(`/workouts/logs?date=${today()}`),
        api.get('/weight'),
      ]);
      setCalories(cal.data);
      setWorkoutLogs(wl.data);
      setWeightLogs(wt.data);
    } catch {}
  };

  const totalCalories = calories.reduce((s, e) => s + e.calories, 0);
  const calorieGoal = user?.dailyCalorieGoal || 2000;
  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const totalProtein = calories.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0);
  const totalWorkoutTime = workoutLogs.reduce((s, l) => s + (l.duration || 0), 0);

  const chartData = weightLogs.slice(-14).map(l => ({ date: l.date.slice(5), weight: parseFloat(l.weight) }));

  return (
    <div className="animate-fade">
      {showUpgradeBanner && (
        <div style={{ padding: '14px 20px', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.3)', borderRadius: 'var(--radius)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--accent)' }}>
          ⚡ <strong>Pro activated!</strong> You now have access to custom workouts, meal plans, and advanced features.
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.02em', marginBottom: 4 }}>
          GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}, {user?.name?.split(' ')[0]?.toUpperCase()}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Today's Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: "TODAY'S CALORIES", value: totalCalories, unit: `/ ${calorieGoal}`, color: 'var(--accent)', icon: '🔥' },
          { label: 'PROTEIN', value: `${Math.round(totalProtein)}g`, unit: 'consumed', color: 'var(--blue)', icon: '💪' },
          { label: 'WORKOUTS', value: workoutLogs.length, unit: 'today', color: 'var(--green)', icon: '⚡' },
          { label: 'ACTIVE TIME', value: `${totalWorkoutTime}`, unit: 'minutes', color: 'var(--orange)', icon: '⏱' },
        ].map(({ label, value, unit, color, icon }) => (
          <div key={label} className="card">
            <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color, letterSpacing: '0.01em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Calorie Progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>CALORIE PROGRESS</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: caloriePercent >= 100 ? 'var(--red)' : 'var(--accent)' }}>
            {Math.round(caloriePercent)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 10, marginBottom: 12 }}>
          <div className="progress-fill" style={{
            width: `${caloriePercent}%`,
            background: caloriePercent >= 100 ? 'var(--red)' : 'var(--accent)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{totalCalories} consumed</span>
          <span>{calorieGoal - totalCalories > 0 ? `${calorieGoal - totalCalories} remaining` : 'Goal reached!'}</span>
        </div>
      </div>

      {/* Weight Chart & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24 }}>
        <div className="card">
          <h2 className="section-title" style={{ fontSize: 18, marginBottom: 20 }}>WEIGHT TREND</h2>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8ff45" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e8ff45" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="weight" stroke="#e8ff45" strokeWidth={2} fill="url(#wg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Log your weight in Profile to see trends
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
          <div className="section-title" style={{ fontSize: 14, color: 'var(--text-muted)' }}>QUICK ACTIONS</div>
          {[
            { to: '/calories', label: 'Log Food', icon: '🔥', color: 'var(--accent)' },
            { to: '/workouts', label: 'Start Workout', icon: '💪', color: 'var(--green)' },
            { to: '/meal-plans', label: 'View Meal Plans', icon: '🥗', color: 'var(--blue)' },
            { to: '/profile', label: 'Update Profile', icon: '👤', color: 'var(--orange)' },
          ].map(({ to, label, icon, color }) => (
            <Link key={to} to={to} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s', fontSize: 14, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {user?.plan === 'free' && (
        <div className="card" style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(232,255,69,0.05), rgba(69,136,255,0.05))', border: '1px solid rgba(232,255,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4 }}>UNLOCK YOUR FULL POTENTIAL</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upgrade to Pro for custom workouts, meal plans & unlimited tracking</div>
          </div>
          <Link to="/pricing" className="btn btn-primary">Upgrade to Pro ⚡</Link>
        </div>
      )}
    </div>
  );
}
