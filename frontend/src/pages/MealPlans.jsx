import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function MealPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const isPro = user?.plan === 'pro';

  const [newPlan, setNewPlan] = useState({
    name: '', description: '', totalCalories: '',
    meals: [{ name: 'Breakfast', foods: [{ name: '', calories: '', protein: '' }] }]
  });

  useEffect(() => { api.get('/meal-plans').then(r => setPlans(r.data)); }, []);

  const addMeal = () => setNewPlan(p => ({ ...p, meals: [...p.meals, { name: 'New Meal', foods: [{ name: '', calories: '', protein: '' }] }] }));
  const addFood = (mi) => {
    const meals = [...newPlan.meals];
    meals[mi] = { ...meals[mi], foods: [...meals[mi].foods, { name: '', calories: '', protein: '' }] };
    setNewPlan(p => ({ ...p, meals }));
  };
  const updateFood = (mi, fi, field, val) => {
    const meals = [...newPlan.meals];
    meals[mi].foods[fi] = { ...meals[mi].foods[fi], [field]: val };
    setNewPlan(p => ({ ...p, meals }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/meal-plans', newPlan);
    setShowCreate(false);
    const r = await api.get('/meal-plans');
    setPlans(r.data);
  };

  const handleDelete = async (id) => {
    await api.delete(`/meal-plans/${id}`);
    setPlans(plans.filter(p => p.id !== id));
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 36 }}>MEAL PLANS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Fuel your performance with expert nutrition</p>
        </div>
        {isPro && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Plan</button>}
      </div>

      {!isPro && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>⚡ Custom Meal Plans — Pro Feature</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create personalized plans. Browse our expert-curated plans below for free.</div>
          </div>
          <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade to Pro</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {plans.map(plan => (
          <div key={plan.id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,255,69,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                {plan.description && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.description}</p>}
              </div>
              {plan.isCustom && <span className="badge badge-pro">Custom</span>}
            </div>

            {plan.totalCalories && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent)' }}>{plan.totalCalories}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>kcal / day</span>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              {(plan.meals || []).map((meal, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{meal.name}</div>
                  {(meal.foods || []).map((food, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', padding: '3px 0' }}>
                      <span>{food.name}</span>
                      <span style={{ color: 'var(--accent)' }}>{food.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelected(selected?.id === plan.id ? null : plan)}>
                {selected?.id === plan.id ? 'Hide Details' : 'View Plan'}
              </button>
              {plan.isCustom && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id)}>Delete</button>
              )}
            </div>

            {selected?.id === plan.id && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-elevated)', borderRadius: 8 }}>
                {(plan.meals || []).map((meal, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)', fontSize: 13 }}>{meal.name}</div>
                    {(meal.foods || []).map((food, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: j < meal.foods.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span>{food.name}</span>
                        <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)' }}>
                          {food.protein && <span>P: {food.protein}g</span>}
                          <span style={{ color: 'var(--accent)' }}>{food.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>CREATE MEAL PLAN</h2>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Plan Name</label>
                <input className="input" placeholder="e.g., My Bulking Plan" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label className="label">Description</label>
                  <input className="input" placeholder="Brief description" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
                </div>
                <div>
                  <label className="label">Total Calories</label>
                  <input className="input" type="number" placeholder="2500" value={newPlan.totalCalories} onChange={e => setNewPlan({...newPlan, totalCalories: e.target.value})} />
                </div>
              </div>

              {newPlan.meals.map((meal, mi) => (
                <div key={mi} style={{ marginBottom: 20, padding: 16, background: 'var(--bg-elevated)', borderRadius: 8 }}>
                  <input className="input" placeholder="Meal name" value={meal.name} onChange={e => { const m = [...newPlan.meals]; m[mi].name = e.target.value; setNewPlan({...newPlan, meals: m}); }} style={{ marginBottom: 12 }} />
                  {meal.foods.map((food, fi) => (
                    <div key={fi} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input className="input" placeholder="Food name" value={food.name} onChange={e => updateFood(mi, fi, 'name', e.target.value)} style={{ fontSize: 13 }} />
                      <input className="input" type="number" placeholder="kcal" value={food.calories} onChange={e => updateFood(mi, fi, 'calories', e.target.value)} style={{ fontSize: 13 }} />
                      <input className="input" type="number" placeholder="protein g" value={food.protein} onChange={e => updateFood(mi, fi, 'protein', e.target.value)} style={{ fontSize: 13 }} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addFood(mi)}>+ Food</button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" style={{ marginBottom: 20 }} onClick={addMeal}>+ Add Meal</button>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Meal Plan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
