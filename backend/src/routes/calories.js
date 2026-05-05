import { Router } from 'express';
import { db } from '../db/index.js';
import { calorieEntries } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { date } = req.query;
  const where = date
    ? and(eq(calorieEntries.userId, req.user.id), eq(calorieEntries.date, date))
    : eq(calorieEntries.userId, req.user.id);
  const entries = await db.select().from(calorieEntries).where(where).orderBy(calorieEntries.createdAt);
  res.json(entries);
});

router.post('/', async (req, res) => {
  const { name, calories, protein, carbs, fat, mealType, date } = req.body;
  const [entry] = await db.insert(calorieEntries)
    .values({ userId: req.user.id, name, calories, protein, carbs, fat, mealType, date })
    .returning();
  res.json(entry);
});

router.delete('/:id', async (req, res) => {
  await db.delete(calorieEntries)
    .where(and(eq(calorieEntries.id, req.params.id), eq(calorieEntries.userId, req.user.id)));
  res.json({ success: true });
});

export default router;
