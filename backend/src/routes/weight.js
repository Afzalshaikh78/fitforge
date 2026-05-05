import { Router } from 'express';
import { db } from '../db/index.js';
import { weightLogs } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const logs = await db.select().from(weightLogs)
    .where(eq(weightLogs.userId, req.user.id))
    .orderBy(weightLogs.date);
  res.json(logs);
});

router.post('/', async (req, res) => {
  const { weight, date } = req.body;
  const [log] = await db.insert(weightLogs)
    .values({ userId: req.user.id, weight, date })
    .returning();
  res.json(log);
});

export default router;
