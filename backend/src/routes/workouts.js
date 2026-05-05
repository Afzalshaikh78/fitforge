import { Router } from 'express';
import { db } from '../db/index.js';
import { workouts, workoutLogs } from '../db/schema.js';
import { eq, and, or, isNull } from 'drizzle-orm';
import { authenticate, requirePro } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Default workouts (templates)
const DEFAULT_WORKOUTS = [
  { id: 'default-1', name: 'Full Body Blast', description: 'Complete full body workout', duration: 45, isCustom: false, isTemplate: true, exercises: [
    { name: 'Squats', sets: 4, reps: 12, weight: null },
    { name: 'Push-ups', sets: 3, reps: 15, weight: null },
    { name: 'Deadlifts', sets: 3, reps: 10, weight: 60 },
    { name: 'Pull-ups', sets: 3, reps: 8, weight: null },
    { name: 'Plank', sets: 3, duration: 60, weight: null },
  ]},
  { id: 'default-2', name: 'Upper Body Power', description: 'Chest, back, and arms', duration: 50, isCustom: false, isTemplate: true, exercises: [
    { name: 'Bench Press', sets: 4, reps: 10, weight: 70 },
    { name: 'Barbell Rows', sets: 4, reps: 10, weight: 60 },
    { name: 'Shoulder Press', sets: 3, reps: 12, weight: 40 },
    { name: 'Bicep Curls', sets: 3, reps: 15, weight: 20 },
    { name: 'Tricep Dips', sets: 3, reps: 12, weight: null },
  ]},
  { id: 'default-3', name: 'Leg Day', description: 'Lower body strength', duration: 40, isCustom: false, isTemplate: true, exercises: [
    { name: 'Squats', sets: 5, reps: 5, weight: 100 },
    { name: 'Leg Press', sets: 4, reps: 12, weight: 150 },
    { name: 'Lunges', sets: 3, reps: 12, weight: 30 },
    { name: 'Calf Raises', sets: 4, reps: 20, weight: null },
  ]},
  { id: 'default-4', name: 'HIIT Cardio', description: '20 min fat burning', duration: 20, isCustom: false, isTemplate: true, exercises: [
    { name: 'Burpees', sets: 4, reps: 10, weight: null },
    { name: 'Jump Squats', sets: 4, reps: 15, weight: null },
    { name: 'Mountain Climbers', sets: 4, duration: 30, weight: null },
    { name: 'Jump Rope', sets: 4, duration: 60, weight: null },
  ]},
];

router.get('/', async (req, res) => {
  const userWorkouts = await db.select().from(workouts)
    .where(eq(workouts.userId, req.user.id));
  res.json([...DEFAULT_WORKOUTS, ...userWorkouts]);
});

router.post('/', requirePro, async (req, res) => {
  const { name, description, exercises, duration } = req.body;
  const [workout] = await db.insert(workouts)
    .values({ userId: req.user.id, name, description, exercises, duration, isCustom: true })
    .returning();
  res.json(workout);
});

router.put('/:id', requirePro, async (req, res) => {
  const { name, description, exercises, duration } = req.body;
  const [workout] = await db.update(workouts)
    .set({ name, description, exercises, duration })
    .where(and(eq(workouts.id, req.params.id), eq(workouts.userId, req.user.id)))
    .returning();
  res.json(workout);
});

router.delete('/:id', async (req, res) => {
  await db.delete(workouts)
    .where(and(eq(workouts.id, req.params.id), eq(workouts.userId, req.user.id)));
  res.json({ success: true });
});

// Workout logs
router.get('/logs', async (req, res) => {
  const { date } = req.query;
  const where = date
    ? and(eq(workoutLogs.userId, req.user.id), eq(workoutLogs.date, date))
    : eq(workoutLogs.userId, req.user.id);
  const logs = await db.select().from(workoutLogs).where(where).orderBy(workoutLogs.createdAt);
  res.json(logs);
});

router.post('/logs', async (req, res) => {
  const { workoutId, name, exercises, duration, caloriesBurned, date, notes } = req.body;
  const [log] = await db.insert(workoutLogs)
    .values({ userId: req.user.id, workoutId, name, exercises, duration, caloriesBurned, date, notes })
    .returning();
  res.json(log);
});

export default router;
