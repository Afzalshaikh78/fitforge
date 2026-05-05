import { Router } from 'express';
import { db } from '../db/index.js';
import { mealPlans } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, requirePro } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const DEFAULT_MEAL_PLANS = [
  { id: 'mp-1', name: 'High Protein Bulk', description: 'Build muscle with 3000+ calories', totalCalories: 3200, isCustom: false, meals: [
    { name: 'Breakfast', foods: [{ name: 'Oats with protein', calories: 450, protein: 35 }, { name: 'Eggs x3', calories: 210, protein: 18 }] },
    { name: 'Lunch', foods: [{ name: 'Chicken breast 200g', calories: 330, protein: 62 }, { name: 'Brown rice 150g', calories: 195, protein: 4 }, { name: 'Broccoli', calories: 55, protein: 4 }] },
    { name: 'Snack', foods: [{ name: 'Greek yogurt', calories: 150, protein: 17 }, { name: 'Banana', calories: 105, protein: 1 }] },
    { name: 'Dinner', foods: [{ name: 'Salmon 180g', calories: 370, protein: 40 }, { name: 'Sweet potato', calories: 180, protein: 4 }, { name: 'Salad', calories: 60, protein: 3 }] },
    { name: 'Post-Workout', foods: [{ name: 'Whey protein shake', calories: 160, protein: 30 }] },
  ]},
  { id: 'mp-2', name: 'Fat Loss Cut', description: 'Caloric deficit for weight loss', totalCalories: 1800, isCustom: false, meals: [
    { name: 'Breakfast', foods: [{ name: 'Egg white omelette', calories: 200, protein: 28 }, { name: 'Spinach & tomato', calories: 30, protein: 3 }] },
    { name: 'Lunch', foods: [{ name: 'Tuna salad', calories: 280, protein: 40 }, { name: 'Whole grain wrap', calories: 150, protein: 5 }] },
    { name: 'Snack', foods: [{ name: 'Almonds 30g', calories: 180, protein: 6 }, { name: 'Apple', calories: 95, protein: 0 }] },
    { name: 'Dinner', foods: [{ name: 'Grilled chicken 150g', calories: 250, protein: 47 }, { name: 'Steamed vegetables', calories: 80, protein: 5 }, { name: 'Quinoa 80g', calories: 120, protein: 5 }] },
  ]},
  { id: 'mp-3', name: 'Vegan Athlete', description: 'Plant-based performance nutrition', totalCalories: 2400, isCustom: false, meals: [
    { name: 'Breakfast', foods: [{ name: 'Tofu scramble', calories: 250, protein: 20 }, { name: 'Avocado toast', calories: 280, protein: 8 }] },
    { name: 'Lunch', foods: [{ name: 'Lentil bowl', calories: 380, protein: 22 }, { name: 'Roasted veggies', calories: 120, protein: 4 }] },
    { name: 'Snack', foods: [{ name: 'Pea protein shake', calories: 140, protein: 25 }, { name: 'Mixed nuts', calories: 200, protein: 6 }] },
    { name: 'Dinner', foods: [{ name: 'Tempeh stir-fry', calories: 420, protein: 30 }, { name: 'Brown rice', calories: 195, protein: 4 }] },
  ]},
];

router.get('/', async (req, res) => {
  const userPlans = await db.select().from(mealPlans).where(eq(mealPlans.userId, req.user.id));
  res.json([...DEFAULT_MEAL_PLANS, ...userPlans]);
});

router.post('/', requirePro, async (req, res) => {
  const { name, description, meals, totalCalories } = req.body;
  const [plan] = await db.insert(mealPlans)
    .values({ userId: req.user.id, name, description, meals, totalCalories, isCustom: true })
    .returning();
  res.json(plan);
});

router.put('/:id', requirePro, async (req, res) => {
  const { name, description, meals, totalCalories } = req.body;
  const [plan] = await db.update(mealPlans)
    .set({ name, description, meals, totalCalories })
    .where(and(eq(mealPlans.id, req.params.id), eq(mealPlans.userId, req.user.id)))
    .returning();
  res.json(plan);
});

router.delete('/:id', async (req, res) => {
  await db.delete(mealPlans)
    .where(and(eq(mealPlans.id, req.params.id), eq(mealPlans.userId, req.user.id)));
  res.json({ success: true });
});

export default router;
