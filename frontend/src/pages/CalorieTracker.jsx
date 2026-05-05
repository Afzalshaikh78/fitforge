import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const today = () => new Date().toISOString().split('T')[0];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];
const COLORS = ['#e8ff45', '#4588ff', '#45ff8a', '#ff8c45', '#a845ff', '#ff4545'];

const FOOD_DB = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Oats (100g)', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Brown Rice (100g)', calories: 123, protein: 2.7, carbs: 26, fat: 1 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Sweet Potato (100g)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: 'Almonds (30g)', calories: 173, protein: 6, carbs: 6, fat: 15 },
  { name: 'Whey Protein Shake', calories: 120, protein: 25, carbs: 3, fat: 2 },
  { name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Avocado (100g)', calories: 160, protein: 2, carbs: 9, fat: 15 },
];

export default function CalorieTracker() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(today());
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEntries(); }, [date]);

  const fetchEntries = async () => {
    const { data } = await api.get(`/calories?date=${date}`);
    setEntries(data);
  };

  const fillFromDB = (food) => {
    setForm({ name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, mealType: form.mealType });
    setSearch('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/calories', { ...form, date });
      setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
      setShowModal(false);
      fetchEntries();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/calories/${id}`);
    setEntries(entries.filter(e => e.id !== id));
  };

  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  entries.forEach(e => {
    total.calories += e.calories;
    total.protein += parseFloat(e.protein || 0);
    total.carbs += parseFloat(e.carbs || 0);
    total.fat += parseFloat(e.fat || 0);
  });

  const goal = user?.dailyCalorieGoal || 2000;
  const remaining = goal - total.calories;

  const macroData = [
    { name: 'Protein', value: Math.round(total.protein * 4), grams: Math.round(total.protein) },
    { name: 'Carbs', value: Math.round(total.carbs * 4), grams: Math.round(total.carbs) },
    { name: 'Fat', value: Math.round(total.fat * 9), grams: Math.round(total.fat) },
  ];

  const mealGroups = MEAL_TYPES.reduce((acc, mt) => {
    const meals = entries.filter(e => e.mealType === mt);
    if (meals.length > 0) acc[mt] = meals;
    return acc;
  }, {});

  const filtered = search.length > 1 ? FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 36 }}>CALORIE TRACKER</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track your nutrition and hit your goals</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Food</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'CONSUMED', value: total.calories, color: 'var(--accent)' },
          { label: 'GOAL', value: goal, color: 'var(--text)' },
          { label: 'REMAINING', value: Math.abs(remaining), color: remaining < 0 ? 'var(--red)' : 'var(--green)' },
          { label: 'PROTEIN', value: `${Math.round(total.protein)}g`, color: 'var(--blue)' },
          { label: 'CARBS', value: `${Math.round(total.carbs)}g`, color: 'var(--orange)' },
          { label: 'FAT', value: `${Math.round(total.fat)}g`, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 24 }}>
        {/* Calorie bar */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DAILY PROGRESS</h3>
          <div className="progress-bar" style={{ height: 14, marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.min((total.calories / goal) * 100, 100)}%`, background: total.calories > goal ? 'var(--red)' : 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {remaining > 0 ? `${remaining} calories remaining` : `${Math.abs(remaining)} over goal`}
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MACROS</div>
            {[
              { name: 'Protein', g: Math.round(total.protein), cal: Math.round(total.protein * 4), color: '#4588ff' },
              { name: 'Carbs', g: Math.round(total.carbs), cal: Math.round(total.carbs * 4), color: '#ff8c45' },
              { name: 'Fat', g: Math.round(total.fat), cal: Math.round(total.fat * 9), color: '#a845ff' },
            ].map(m => (
              <div key={m.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{m.g}g · {m.cal} kcal</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((m.cal / total.calories) * 100, 100)}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}>MACRO SPLIT</h3>
          {total.calories > 0 ? (
            <ResponsiveContainer width={200} height={180}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {macroData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v, n, p) => [`${p.payload.grams}g`, p.payload.name]} contentStyle={{ background: '#111', border: '1px solid #222', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Log food to see split</div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {['Protein', 'Carbs', 'Fat'].map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                <span style={{ color: 'var(--text-muted)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal groups */}
      {Object.keys(mealGroups).length > 0 ? (
        Object.entries(mealGroups).map(([mealType, items]) => (
          <div key={mealType} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: 14 }}>{mealType}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {items.reduce((s, i) => s + i.calories, 0)} kcal
              </span>
            </div>
            {items.map(entry => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    P: {parseFloat(entry.protein || 0).toFixed(1)}g · C: {parseFloat(entry.carbs || 0).toFixed(1)}g · F: {parseFloat(entry.fat || 0).toFixed(1)}g
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)' }}>{entry.calories}</span>
                  <button onClick={() => handleDelete(entry.id)} style={{ color: 'var(--text-muted)', fontSize: 16, padding: '4px 8px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>×</button>
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No food logged today</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Start tracking your nutrition to reach your goals</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Your First Meal</button>
        </div>
      )}

      {/* Add Food Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.03em' }}>LOG FOOD</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>

            {/* Quick search */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">Quick Search</label>
              <input className="input" placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} />
              {filtered.length > 0 && (
                <div style={{ marginTop: 8, border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
                  {filtered.map(food => (
                    <button key={food.name} onClick={() => fillFromDB(food)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}>
                      <span>{food.name}</span>
                      <span style={{ color: 'var(--accent)' }}>{food.calories} kcal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Food Name</label>
                <input className="input" placeholder="e.g., Chicken & Rice" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="label">Calories *</label>
                  <input className="input" type="number" placeholder="0" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} required min="1" />
                </div>
                <div>
                  <label className="label">Meal Type</label>
                  <select className="select" value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})}>
                    {MEAL_TYPES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div><label className="label">Protein (g)</label><input className="input" type="number" placeholder="0" value={form.protein} onChange={e => setForm({...form, protein: e.target.value})} /></div>
                <div><label className="label">Carbs (g)</label><input className="input" type="number" placeholder="0" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} /></div>
                <div><label className="label">Fat (g)</label><input className="input" type="number" placeholder="0" value={form.fat} onChange={e => setForm({...form, fat: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Adding...' : 'Add Food Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
