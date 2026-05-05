import React, { useState, useEffect } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

const today = () => new Date().toISOString().split('T')[0];

export default function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('library');
  const [showCreate, setShowCreate] = useState(false);
  const [showLog, setShowLog] = useState(null);
  const [logForm, setLogForm] = useState({ duration: '', caloriesBurned: '', notes: '' });
  const isPro = user?.plan === 'pro';

  const [newWorkout, setNewWorkout] = useState({
    name: '', description: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: '' }]
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [w, l] = await Promise.all([api.get('/workouts'), api.get('/workouts/logs')]);
    setWorkouts(w.data);
    setLogs(l.data);
  };

  const handleLogWorkout = async (workout) => {
    try {
      await api.post('/workouts/logs', {
        workoutId: workout.id?.startsWith('default') ? null : workout.id,
        name: workout.name,
        exercises: workout.exercises,
        duration: parseInt(logForm.duration) || workout.duration,
        caloriesBurned: parseInt(logForm.caloriesBurned) || null,
        notes: logForm.notes,
        date: today(),
      });
      setShowLog(null);
      setLogForm({ duration: '', caloriesBurned: '', notes: '' });
      fetchAll();
    } catch {}
  };

  const addExercise = () => setNewWorkout(w => ({ ...w, exercises: [...w.exercises, { name: '', sets: 3, reps: 10, weight: '' }] }));
  const updateEx = (i, field, val) => {
    const exs = [...newWorkout.exercises];
    exs[i] = { ...exs[i], [field]: val };
    setNewWorkout(w => ({ ...w, exercises: exs }));
  };
  const removeEx = (i) => setNewWorkout(w => ({ ...w, exercises: w.exercises.filter((_, idx) => idx !== i) }));

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    await api.post('/workouts', newWorkout);
    setShowCreate(false);
    setNewWorkout({ name: '', description: '', duration: '', exercises: [{ name: '', sets: 3, reps: 10, weight: '' }] });
    fetchAll();
  };

  const customWorkouts = workouts.filter(w => w.isCustom);
  const templateWorkouts = workouts.filter(w => !w.isCustom);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ fontSize: 36 }}>WORKOUTS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Train hard, recover smart</p>
        </div>
        {isPro && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Custom Workout</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
        {['library', 'custom', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            textTransform: 'capitalize', transition: 'all 0.15s',
            background: activeTab === tab ? 'var(--accent)' : 'transparent',
            color: activeTab === tab ? '#000' : 'var(--text-muted)',
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'library' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {templateWorkouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} onLog={() => { setShowLog(workout); setLogForm({ duration: workout.duration || '', caloriesBurned: '', notes: '' }); }} />
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <div>
          {!isPro && (
            <div className="card" style={{ marginBottom: 24, background: 'var(--accent-dim)', border: '1px solid rgba(232,255,69,0.2)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>⚡ Pro Feature</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create custom workouts tailored to your goals</div>
              </div>
              <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade Now</Link>
            </div>
          )}
          {customWorkouts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No custom workouts yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Build workouts designed specifically for your goals</div>
              {isPro && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Your First Workout</button>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {customWorkouts.map(workout => (
                <WorkoutCard key={workout.id} workout={workout} onLog={() => { setShowLog(workout); setLogForm({ duration: workout.duration || '', caloriesBurned: '', notes: '' }); }} isCustom />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {logs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>No workouts logged yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Start a workout to see your history here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {logs.slice().reverse().map(log => (
                <div key={log.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{log.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {log.date} · {log.exercises?.length || 0} exercises
                      {log.duration && ` · ${log.duration} min`}
                      {log.caloriesBurned && ` · ${log.caloriesBurned} kcal burned`}
                    </div>
                    {log.notes && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, fontStyle: 'italic' }}>{log.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {log.duration && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)' }}>{log.duration}min</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log Workout Modal */}
      {showLog && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLog(null)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>LOG WORKOUT</h2>
              <button onClick={() => setShowLog(null)} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{showLog.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{showLog.exercises?.length} exercises</div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Duration (minutes)</label>
              <input className="input" type="number" placeholder={showLog.duration || '30'} value={logForm.duration} onChange={e => setLogForm({...logForm, duration: e.target.value})} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="label">Calories Burned</label>
              <input className="input" type="number" placeholder="e.g., 350" value={logForm.caloriesBurned} onChange={e => setLogForm({...logForm, caloriesBurned: e.target.value})} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">Notes</label>
              <textarea className="input" placeholder="How did it go?" value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleLogWorkout(showLog)}>
              ✓ Log Workout
            </button>
          </div>
        </div>
      )}

      {/* Create Workout Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>CREATE WORKOUT</h2>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateWorkout}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Workout Name</label>
                  <input className="input" placeholder="e.g., Monday Push Day" value={newWorkout.name} onChange={e => setNewWorkout({...newWorkout, name: e.target.value})} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Description</label>
                  <input className="input" placeholder="Brief description..." value={newWorkout.description} onChange={e => setNewWorkout({...newWorkout, description: e.target.value})} />
                </div>
                <div>
                  <label className="label">Duration (min)</label>
                  <input className="input" type="number" placeholder="45" value={newWorkout.duration} onChange={e => setNewWorkout({...newWorkout, duration: e.target.value})} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="label" style={{ marginBottom: 0 }}>EXERCISES</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addExercise}>+ Add</button>
                </div>
                {newWorkout.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <input className="input" placeholder="Exercise name" value={ex.name} onChange={e => updateEx(i, 'name', e.target.value)} style={{ fontSize: 13 }} />
                    <input className="input" type="number" placeholder="Sets" value={ex.sets} onChange={e => updateEx(i, 'sets', e.target.value)} style={{ fontSize: 13 }} />
                    <input className="input" type="number" placeholder="Reps" value={ex.reps} onChange={e => updateEx(i, 'reps', e.target.value)} style={{ fontSize: 13 }} />
                    <input className="input" type="number" placeholder="kg" value={ex.weight} onChange={e => updateEx(i, 'weight', e.target.value)} style={{ fontSize: 13 }} />
                    <button type="button" onClick={() => removeEx(i)} style={{ color: 'var(--red)', fontSize: 18, padding: '0 4px' }}>×</button>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Workout</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ workout, onLog, isCustom }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,255,69,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{workout.name}</h3>
          {workout.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{workout.description}</p>}
        </div>
        {isCustom && <span className="badge badge-pro">Custom</span>}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {workout.duration && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {workout.duration} min</span>}
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💪 {workout.exercises?.length || 0} exercises</span>
      </div>
      {expanded && workout.exercises && (
        <div style={{ marginBottom: 16, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          {workout.exercises.map((ex, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: i < workout.exercises.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontWeight: 500 }}>{ex.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''}{ex.duration ? ` ${ex.duration}s` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onLog}>Start & Log</button>
        <button className="btn btn-outline btn-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>
    </div>
  );
}
